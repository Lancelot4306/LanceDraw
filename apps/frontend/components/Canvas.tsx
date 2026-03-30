import { useEffect, useRef, useState } from "react";
import useWindowSize from "../hooks/useWindowSize";
import { IconButton } from "./IconButton";
import { Circle, Pencil, RectangleHorizontalIcon, Eraser, Hash, Copy, Check } from "lucide-react";
import { Game } from "@/draw/game";

export type Tool = "circle" | "rect" | "pencil" | "eraser";

function RoomIdBadge({ roomId }: { roomId: string }) {
    const [copied, setCopied] = useState(false);

    async function handleCopy() {
        try {
            await navigator.clipboard.writeText(roomId);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch { }
    }

    return (
        <div
            title="Room ID — share this so others can join"
            className="flex items-center gap-1.5 bg-black/60 backdrop-blur-sm border border-white/10 text-white/80 text-xs font-mono px-3 py-1.5 rounded-lg"
        >
            <Hash className="w-3 h-3 text-white/50" />
            <span>{roomId}</span>
            <button
                onClick={handleCopy}
                className="ml-1 text-white/50 hover:text-white transition-colors"
                title="Copy Room ID"
            >
                {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
            </button>
        </div>
    );
}

function Topbar({ selectedTool, setSelectedTool, roomId }: {
    selectedTool: Tool;
    setSelectedTool: (s: Tool) => void;
    roomId: string;
}) {
    return (
        <div style={{ position: "fixed", top: 10, left: 10, right: 10, display: "flex", alignItems: "center", justifyContent: "space-between", pointerEvents: "none" }}>
            <div style={{ pointerEvents: "auto" }} className="flex gap-1">
                <IconButton
                    onClick={() => setSelectedTool("pencil")}
                    activated={selectedTool === "pencil"}
                    icon={<Pencil />}
                />
                <IconButton
                    onClick={() => setSelectedTool("rect")}
                    activated={selectedTool === "rect"}
                    icon={<RectangleHorizontalIcon />}
                />
                <IconButton
                    onClick={() => setSelectedTool("circle")}
                    activated={selectedTool === "circle"}
                    icon={<Circle />}
                />
                <IconButton
                    onClick={() => setSelectedTool("eraser")}
                    activated={selectedTool === "eraser"}
                    icon={<Eraser />}
                />
            </div>

            <div style={{ pointerEvents: "auto" }}>
                <RoomIdBadge roomId={roomId} />
            </div>
        </div>
    );
}

export function Canvas({
    roomId,
    socket,
    token,
}: {
    socket: WebSocket;
    roomId: string;
    token: string;
}) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const windowSize = useWindowSize();
    const [game, setGame] = useState<Game>();
    const [selectedTool, setSelectedTool] = useState<Tool>("circle");

    useEffect(() => {
        game?.setTool(selectedTool);
    }, [selectedTool, game]);

    useEffect(() => {
        if (canvasRef.current) {
            const g = new Game(canvasRef.current, roomId, socket, token);
            setGame(g);
            return () => { g.destroy(); };
        }
    }, [canvasRef]);

    return (
        <div style={{ height: "100vh", overflow: "hidden" }}>
            <canvas
                ref={canvasRef}
                width={window.innerWidth}
                height={window.innerHeight}
                style={{ cursor: selectedTool === "eraser" ? "cell" : "crosshair" }}
            />
            <Topbar setSelectedTool={setSelectedTool} selectedTool={selectedTool} roomId={roomId} />
        </div>
    );
}