"use client";

import { WS_URL } from "@/config";
import { useEffect, useState } from "react";
import { Canvas } from "./Canvas";

export function RoomCanvas({roomId}: {roomId: string}) {
    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        const ws = new WebSocket(`${WS_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI3NGRhZjhkNC1iNmZmLTQ1NjQtOGQ4OC1iOWZmZGMzYjk4MTYiLCJpYXQiOjE3NzQ2NzI3NDd9.CDtG-1shCDuD7eWaJIgzKY6N0jjyxPdwZU4cybAoE7s`)

        ws.onopen = () => {
            setSocket(ws);
            const data = JSON.stringify({
                type: "join_room",
                roomId
            });
            console.log(data);
            ws.send(data);
        }
        
    }, [])
   
    if (!socket) {
        return <div>
            Connecting to server...
        </div>
    }

    return <div>
        <Canvas roomId={roomId} socket={socket} />
    </div>
}