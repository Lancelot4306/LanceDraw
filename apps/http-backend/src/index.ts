import express from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from '@repo/backend-common/config';
import { middleware } from "./middleware";
import { CreateUserSchema, SigninSchema, CreateRoomSchema } from "@repo/common/types";
import { prisma } from "@repo/database/client";
import cors from "cors";

const app = express();
const PORT = 3001;

app.use(express.json());
app.use(cors());

app.post("/signup", async (req, res) => {
    const parsedData = CreateUserSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.json({ 
            message: "Incorrect inputs" 
        });
        return;
    }
    try {
        const user = await prisma.user.create({
            data: {
                email: parsedData.data?.username,
                password: parsedData.data.password,
                name: parsedData.data.name,
            },
        });
        res.json({ 
            userId: user.id 
        });
    } catch (error) {
        res.status(411).json({ 
            message: "User already exists with this username" 
        });
    }
});

app.post("/signin", async (req, res) => {
    const parsedData = SigninSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.json({ 
            message: "Incorrect inputs" 
        });
        return;
    }
    const user = await prisma.user.findFirst({
        where: {
            email: parsedData.data.username,
            password: parsedData.data.password,
        },
    });
    if (!user) {
        res.status(403).json({ 
            message: "Not authorized" 
        });
        return;
    }
    const token = jwt.sign({ 
        userId: user?.id 
    }, JWT_SECRET);

    res.json({ 
        token 
    });
});

app.post("/room", middleware, async (req, res) => {
    const parsedData = CreateRoomSchema.safeParse(req.body);
    if (!parsedData.success) {
        res.json({ 
            message: "Incorrect inputs" 
        });
        return;
    }
    const userId = req.userId;
    if (!userId) {
        return res.status(401).json({ 
            message: "Unauthorized" 
        });
    }
    try {
        const room = await prisma.room.create({
            data: { 
                slug: parsedData.data.name, 
                adminId: userId 
            }
        });
        
        res.json({ 
            roomId: room.id 
        });
    } catch (error) {
        res.status(411).json({ 
            message: "Room already exists with this name" 
        });
    }
});

app.get("/chats/:roomId", async (req, res) => {
    try {
        const roomId = Number(req.params.roomId);
        const messages = await prisma.chat.findMany({
            where: { 
                roomId 
            },
            orderBy: { 
                id: "desc" 
            },
        });

        res.json({ 
            messages 
        });
    } catch (error) {
        res.json({ 
            messages: [] 
        });
    }
});

app.get("/room/:slug", async (req, res) => {
    const slug = req.params.slug;
    const room = await prisma.room.findFirst({ 
        where: { 
            slug 
        } 
    });
    
    res.json({ 
        room 
    });
});

app.get("/rooms", middleware, async (req, res) => {
    const userId = req.userId;
    if (!userId) {
        return res.status(401).json({ 
            message: "Unauthorized" 
        });
    }

    const rooms = await prisma.room.findMany({
        where: { 
            adminId: userId 
        },
        orderBy: { 
            id: "desc" 
        },
    });

    res.json({ 
        rooms 
    });
});

app.delete("/shape/:shapeId", middleware, async (req, res) => {
    const shapeId = Number(req.params.shapeId);
    if (isNaN(shapeId)) {
        return res.status(400).json({ 
            message: "Invalid shape id" 
        });
    }
    try {
        await prisma.chat.delete({ 
            where: { 
                id: shapeId 
            } 
        });

        res.json({ 
            success: true 
        });
    } catch (error) {
        res.status(404).json({ 
            message: "Shape not found" 
        });
    }
});

app.listen(PORT, () => {
    console.log(`App listening on ${PORT}`);
});