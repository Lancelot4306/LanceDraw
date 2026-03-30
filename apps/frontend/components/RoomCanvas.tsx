"use client";

import { WS_URL } from "@/config";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Canvas } from "./Canvas";

export function RoomCanvas({ roomId }: { roomId: string }) {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [token, setToken] = useState<string>("");
    const [connectionError, setConnectionError] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            router.push("/signin");
            return;
        }
        setToken(token);

        const ws = new WebSocket(`${WS_URL}?token=${token}`);

        ws.onopen = () => {
            setSocket(ws);
            ws.send(JSON.stringify({
                type: "join_room",
                roomId
            }));
        };

        ws.onerror = () => {
            setConnectionError(true);
        };

        ws.onclose = () => {
            setSocket(null);
        };

        return () => {
            ws.close();
        };
    }, [roomId]);

    if (connectionError) {
        return <div>Failed to connect to server. Please refresh and try again.</div>;
    }

    if (!socket) {
        return <div>Connecting to server...</div>;
    }

    return (
        <div>
            <Canvas roomId={roomId} socket={socket} token={token} />
        </div>
    );
}