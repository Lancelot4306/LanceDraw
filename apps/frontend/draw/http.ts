import { HTTP_BACKEND } from "@/config";
import axios from "axios";

type Shape = {
    type: "rect";
    id?: number;
    x: number;
    y: number;
    width: number;
    height: number;
} | {
    type: "circle";
    id?: number;
    centerX: number;
    centerY: number;
    radius: number;
} | {
    type: "pencil";
    id?: number;
    points: { x: number; y: number }[];
}

export async function getExistingShapes(roomId: string): Promise<Shape[]> {
    const res = await axios.get(`${HTTP_BACKEND}/chats/${roomId}`);
    const messages = res.data.messages;

    const shapes: Shape[] = messages
        .map((x: { id: number; message: string }) => {
            try {
                const messageData = JSON.parse(x.message);
                if (!messageData?.shape) return null;
                return { ...messageData.shape, id: x.id };
            } catch {
                return null;
            }
        })
        .filter(Boolean);

    return shapes;
}

export async function deleteShape(shapeId: number, token: string): Promise<void> {
    await axios.delete(`${HTTP_BACKEND}/shape/${shapeId}`, {
        headers: { 
            Authorization: `Bearer ${token}` 
        },
    });
}