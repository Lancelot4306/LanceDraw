import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });

import { WebSocket, WebSocketServer } from 'ws';
import jwt from "jsonwebtoken";
import { JWT_SECRET } from '@repo/backend-common/config';
import { prisma } from "@repo/database/client";

const PORT = Number(process.env.PORT) || 8080;
const wss = new WebSocketServer({ port: PORT, host: "0.0.0.0" });

interface User {
    ws: WebSocket;
    rooms: string[];
    userId: string;
}

const users: User[] = [];

function checkUser(token: string): string | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (typeof decoded === "string" || !decoded || !decoded.userId) {
            return null;
        }
        return decoded.userId;
    } catch {
        return null;
    }
}

wss.on('connection', function connection(ws, request) {
    const url = request.url;
    if (!url) {
        ws.close();
        return;
    }

    const queryParams = new URLSearchParams(url.split('?')[1]);
    const token = queryParams.get('token') || "";
    const userId = checkUser(token);
    if (!userId) {
        ws.close();
        return;
    }

    const user: User = { userId, rooms: [], ws };
    users.push(user);

    ws.on('message', async function message(data) {
        let parsedData;
        try {
            parsedData = JSON.parse(typeof data !== "string" ? data.toString() : data);
        } catch {
            return;
        }

        if (parsedData.type === "join_room") {
            const roomId = String(parsedData.roomId);
            if (!user.rooms.includes(roomId)) {
                user.rooms.push(roomId);
            }
        }

        if (parsedData.type === "leave_room") {
            user.rooms = user.rooms.filter(x => x !== String(parsedData.roomId));
        }

        if (parsedData.type === "chat") {
            const roomId = String(parsedData.roomId);
            const message = parsedData.message;

            await prisma.chat.create({
                data: {
                    roomId: Number(roomId),
                    message,
                    userId,
                }
            });

            users.forEach(u => {
                if (u.rooms.includes(roomId)) {
                    u.ws.send(JSON.stringify({ type: "chat", message, roomId }));
                }
            });
        }

        if (parsedData.type === "erase") {
            const roomId = String(parsedData.roomId);
            users.forEach(u => {
                if (u.rooms.includes(roomId) && u.ws !== ws) {
                    u.ws.send(JSON.stringify({
                        type: "erase",
                        shapeId: parsedData.shapeId,
                        roomId,
                    }));
                }
            });
        }
    });

    ws.on('close', function () {
        const index = users.indexOf(user);
        if (index !== -1) {
            users.splice(index, 1);
        }
    });
});

console.log(`WebSocket server running on port ${PORT}`);