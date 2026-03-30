import { Tool } from "@/components/Canvas";
import { getExistingShapes, deleteShape } from "./http";

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

export class Game {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private existingShapes: Shape[];
    private roomId: string;
    private token: string;
    private clicked: boolean;
    private startX = 0;
    private startY = 0;
    private selectedTool: Tool = "circle";
    private pencilPoints: { x: number; y: number }[] = [];

    socket: WebSocket;

    constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket, token: string) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;
        this.existingShapes = [];
        this.roomId = roomId;
        this.socket = socket;
        this.token = token;
        this.clicked = false;
        this.init();
        this.initHandlers();
        this.initMouseHandlers();
    }

    destroy() {
        this.canvas.removeEventListener("mousedown", this.mouseDownHandler);
        this.canvas.removeEventListener("mouseup", this.mouseUpHandler);
        this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
    }

    setTool(tool: Tool) {
        this.selectedTool = tool;
    }

    async init() {
        this.existingShapes = await getExistingShapes(this.roomId);
        this.clearCanvas();
    }

    initHandlers() {
        this.socket.onmessage = (event) => {
            const message = JSON.parse(event.data);

            if (message.type === "chat") {
                const parsedShape = JSON.parse(message.message);
                this.existingShapes.push(parsedShape.shape);
                this.clearCanvas();
            }

            if (message.type === "erase") {
                this.existingShapes = this.existingShapes.filter(
                    (s) => s.id !== message.shapeId
                );
                this.clearCanvas();
            }
        };
    }

    clearCanvas() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "rgba(0, 0, 0)";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.existingShapes.forEach((shape) => {
            this.ctx.strokeStyle = "rgba(255, 255, 255)";

            if (shape.type === "rect") {
                this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
            } else if (shape.type === "circle") {
                this.ctx.beginPath();
                this.ctx.arc(shape.centerX, shape.centerY, Math.abs(shape.radius), 0, Math.PI * 2);
                this.ctx.stroke();
                this.ctx.closePath();
            } else if (shape.type === "pencil") {
                this.drawPencilPath(shape.points);
            }
        });
    }

    private drawPencilPath(points: { x: number; y: number }[]) {
        if (points.length < 2) return;
        this.ctx.strokeStyle = "rgba(255, 255, 255)";
        this.ctx.lineWidth = 2;
        this.ctx.lineCap = "round";
        this.ctx.lineJoin = "round";
        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) {
            this.ctx.lineTo(points[i].x, points[i].y);
        }
        this.ctx.stroke();
        this.ctx.closePath();
        this.ctx.lineWidth = 1;
    }

    private isPointOnShape(x: number, y: number, shape: Shape): boolean {
        const TOLERANCE = 6;

        if (shape.type === "rect") {
            const { x: rx, y: ry, width: rw, height: rh } = shape;
            const nearLeft   = Math.abs(x - rx) <= TOLERANCE        && y >= ry - TOLERANCE && y <= ry + rh + TOLERANCE;
            const nearRight  = Math.abs(x - (rx + rw)) <= TOLERANCE && y >= ry - TOLERANCE && y <= ry + rh + TOLERANCE;
            const nearTop    = Math.abs(y - ry) <= TOLERANCE        && x >= rx - TOLERANCE && x <= rx + rw + TOLERANCE;
            const nearBottom = Math.abs(y - (ry + rh)) <= TOLERANCE && x >= rx - TOLERANCE && x <= rx + rw + TOLERANCE;
            return nearLeft || nearRight || nearTop || nearBottom;
        }

        if (shape.type === "circle") {
            const dist = Math.sqrt(
                Math.pow(x - shape.centerX, 2) + Math.pow(y - shape.centerY, 2)
            );
            return Math.abs(dist - shape.radius) <= TOLERANCE;
        }

        if (shape.type === "pencil") {
            const pts = shape.points;
            for (let i = 0; i < pts.length - 1; i++) {
                if (this.distToSegment(x, y, pts[i], pts[i + 1]) <= TOLERANCE) {
                    return true;
                }
            }
            return false;
        }

        return false;
    }

    private distToSegment(
        px: number, py: number,
        a: { x: number; y: number },
        b: { x: number; y: number }
    ): number {
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const lenSq = dx * dx + dy * dy;
        if (lenSq === 0) return Math.hypot(px - a.x, py - a.y);
        const t = Math.max(0, Math.min(1, ((px - a.x) * dx + (py - a.y) * dy) / lenSq));
        return Math.hypot(px - (a.x + t * dx), py - (a.y + t * dy));
    }

    private async eraseShapeAt(x: number, y: number) {
        for (let i = this.existingShapes.length - 1; i >= 0; i--) {
            const shape = this.existingShapes[i];
            if (this.isPointOnShape(x, y, shape)) {
                this.existingShapes.splice(i, 1);
                this.clearCanvas();

                if (shape.id !== undefined) {
                    await deleteShape(shape.id, this.token);

                    this.socket.send(JSON.stringify({
                        type: "erase",
                        shapeId: shape.id,
                        roomId: this.roomId,
                    }));
                }
                break;
            }
        }
    }

    mouseDownHandler = (e: MouseEvent) => {
        this.clicked = true;
        this.startX = e.clientX;
        this.startY = e.clientY;

        if (this.selectedTool === "pencil") {
            this.pencilPoints = [{ x: e.clientX, y: e.clientY }];
        }

        if (this.selectedTool === "eraser") {
            this.eraseShapeAt(e.clientX, e.clientY);
        }
    };

    mouseUpHandler = (e: MouseEvent) => {
        this.clicked = false;
        if (this.selectedTool === "eraser") return;

        let shape: Shape | null = null;

        if (this.selectedTool === "rect") {
            shape = {
                type: "rect",
                x: this.startX,
                y: this.startY,
                width: e.clientX - this.startX,
                height: e.clientY - this.startY,
            };
        } else if (this.selectedTool === "circle") {
            const centerX = (this.startX + e.clientX) / 2;
            const centerY = (this.startY + e.clientY) / 2;
            const radius = Math.sqrt(
                Math.pow(e.clientX - this.startX, 2) + Math.pow(e.clientY - this.startY, 2)
            ) / 2;
            shape = { type: "circle", centerX, centerY, radius };
        } else if (this.selectedTool === "pencil") {
            this.pencilPoints.push({ x: e.clientX, y: e.clientY });
            if (this.pencilPoints.length >= 2) {
                shape = { type: "pencil", points: [...this.pencilPoints] };
            }
            this.pencilPoints = [];
        }

        if (!shape) return;

        // this.existingShapes.push(shape);
        this.socket.send(JSON.stringify({
            type: "chat",
            message: JSON.stringify({ shape }),
            roomId: this.roomId,
        }));
    };

    mouseMoveHandler = (e: MouseEvent) => {
        if (!this.clicked) return;

        if (this.selectedTool === "eraser") {
            this.eraseShapeAt(e.clientX, e.clientY);
            return;
        }

        const width = e.clientX - this.startX;
        const height = e.clientY - this.startY;

        if (this.selectedTool === "pencil") {
            this.pencilPoints.push({ x: e.clientX, y: e.clientY });
            this.clearCanvas();
            this.drawPencilPath(this.pencilPoints);
            return;
        }

        this.clearCanvas();
        this.ctx.strokeStyle = "rgba(255, 255, 255)";

        if (this.selectedTool === "rect") {
            this.ctx.strokeRect(this.startX, this.startY, width, height);
        } else if (this.selectedTool === "circle") {
            const centerX = (this.startX + e.clientX) / 2;
            const centerY = (this.startY + e.clientY) / 2;
            const radius = Math.sqrt(width * width + height * height) / 2;
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, Math.abs(radius), 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.closePath();
        }
    };

    initMouseHandlers() {
        this.canvas.addEventListener("mousedown", this.mouseDownHandler);
        this.canvas.addEventListener("mouseup", this.mouseUpHandler);
        this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
    }
}