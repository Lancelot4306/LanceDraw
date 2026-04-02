# LanceDraw

A real-time collaborative whiteboard built with Next.js, Express, WebSockets, and Prisma. Draw shapes, sketch freely, and collaborate with others in shared rooms — all changes sync instantly across every connected client.

---

## Features

- **Real-time collaboration** — changes broadcast instantly via WebSocket to all users in a room
- **Drawing tools** — rectangle, circle, freehand pencil, and eraser
- **Eraser** — touches and removes shapes directly from the canvas and the database
- **Rooms** — create named rooms, share a Room ID for others to join, delete rooms you own
- **Auth** — JWT-based sign up / sign in with auto sign-in after registration
- **Persistent canvas** — all shapes are stored in Postgres and reloaded on reconnect

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), Tailwind CSS, Lucide icons |
| HTTP API | Express, Zod validation, Prisma ORM |
| Real-time | `ws` WebSocket server |
| Database | PostgreSQL via Prisma |
| Auth | JSON Web Tokens (JWT) |
| Monorepo | pnpm workspaces, shared `@repo/*` packages |

---

## Project Structure

```
draw-app/
├── apps/
│   ├── frontend/          # Next.js app
│   │   ├── app/
│   │   │   ├── page.tsx           # Landing page
│   │   │   ├── signin/page.tsx
│   │   │   ├── signup/page.tsx
│   │   │   ├── dashboard/page.tsx # Room management
│   │   │   └── canvas/[slug]/     # Whiteboard
│   │   └── components/
│   │       ├── AuthPage.tsx
│   │       ├── RoomCanvas.tsx
│   │       ├── Canvas.tsx
│   │       └── IconButton.tsx
│   ├── http-backend/      # Express REST API (port 3001)
│   │   └── src/
│   │       ├── index.ts
│   │       └── middleware.ts
│   └── ws-server/         # WebSocket server (port 8080)
│       └── src/
│           └── index.ts
└── packages/
    ├── backend-common/    # JWT_SECRET config
    ├── common/            # Zod schemas (shared types)
    └── database/          # Prisma client
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- PostgreSQL database

### 1. Clone and install

```bash
git clone https://github.com/your-username/draw-app.git
cd draw-app
pnpm install
```

### 2. Set up environment variables

Create a `.env` file in the project root:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/drawapp"
JWT_SECRET="your-secret-key-here"
```

### 3. Run database migrations

```bash
pnpm --filter @repo/database exec prisma migrate dev
```

### 4. Start all services

```bash
pnpm dev
```

This starts:
- Frontend at `http://localhost:3000`
- HTTP backend at `http://localhost:3001`
- WebSocket server at `ws://localhost:8080`

---

## Environment Variables

### Frontend (`apps/frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:8080
```

### Backend / WS server (root `.env`)

```env
DATABASE_URL=postgresql://user:password@localhost:5432/drawapp
JWT_SECRET=your-secret-key-here
PORT=3001        # http-backend
PORT=8080        # ws-server
```

---

## API Reference

### Auth

| Method | Endpoint | Body | Description |
|---|---|---|---|
| POST | `/signup` | `{ username, password, name }` | Create account |
| POST | `/signin` | `{ username, password }` | Returns JWT token |

### Rooms

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/rooms` | ✓ | List your rooms |
| POST | `/room` | ✓ | Create a room |
| GET | `/room/:slug` | — | Get room by slug |
| GET | `/room/id/:roomId` | — | Get room by numeric ID |
| DELETE | `/room/:roomId` | ✓ | Delete room (admin only) |

### Canvas

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/chats/:roomId` | — | Load existing shapes |
| DELETE | `/shape/:shapeId` | ✓ | Erase a shape |

### WebSocket Events

Connect: `ws://localhost:8080?token=<jwt>`

| Type | Direction | Payload | Description |
|---|---|---|---|
| `join_room` | Client → Server | `{ roomId }` | Join a room |
| `leave_room` | Client → Server | `{ roomId }` | Leave a room |
| `chat` | Bidirectional | `{ roomId, message }` | Draw a shape (message is JSON-encoded shape) |
| `erase` | Bidirectional | `{ roomId, shapeId }` | Erase a shape |

---

## Database Schema

```prisma
model User {
  id       String  @id @default(uuid())
  email    String  @unique
  password String
  name     String
  photo    String?
  chats    Chat[]
  rooms    Room[]
}

model Room {
  id        Int      @id @default(autoincrement())
  slug      String   @unique
  createdAt DateTime @default(now())
  adminId   String
  admin     User     @relation(fields: [adminId], references: [id])
  chats     Chat[]
}

model Chat {
  id      Int    @id @default(autoincrement())
  roomId  Int
  message String
  userId  String
  room    Room   @relation(fields: [roomId], references: [id])
  user    User   @relation(fields: [userId], references: [id])
}
```

---

## Deployment

The recommended approach is to deploy all three services to [Railway](https://railway.app) as separate services within one project, with a Railway-managed Postgres database.

### Steps

1. Push your repo to GitHub
2. Create a new Railway project and add three services — one per app, each pointing to the same repo with a different **Root Directory**:
   - `apps/frontend`
   - `apps/http-backend`
   - `apps/ws-server`
3. Add a **PostgreSQL** database service — Railway injects `DATABASE_URL` automatically
4. Set environment variables per service (see above)
5. Set the http-backend start command to run migrations on deploy:
   ```bash
   npx prisma migrate deploy && node dist/index.js
   ```
6. Generate a public domain for each service and update the frontend env vars with the live URLs (use `wss://` for the WebSocket server)

---

## Known Limitations

- Passwords are stored in plaintext — hashing with bcrypt is marked as a TODO in the codebase
- No member/guest system — only room admins (creators) appear in the dashboard; others join via Room ID
- No undo/redo
- Mobile touch events are not yet handled

---