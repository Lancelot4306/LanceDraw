"use client";

import { useEffect, useState } from "react";
import { Pencil, Plus, LogOut, Clock, ArrowRight, X, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

interface Room {
    id: number;
    slug: string;
    adminId: string;
    createdAt?: string;
}

function timeAgo(dateStr?: string) {
    if (!dateStr) return "Recently";
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

const CARD_ACCENTS = [
    { gradient: "from-blue-50",   border: "border-blue-200",   iconBg: "bg-blue-100",   iconText: "text-blue-600"   },
    { gradient: "from-green-50",  border: "border-green-200",  iconBg: "bg-green-100",  iconText: "text-green-600"  },
    { gradient: "from-purple-50", border: "border-purple-200", iconBg: "bg-purple-100", iconText: "text-purple-600" },
    { gradient: "from-orange-50", border: "border-orange-200", iconBg: "bg-orange-100", iconText: "text-orange-600" },
    { gradient: "from-cyan-50",   border: "border-cyan-200",   iconBg: "bg-cyan-100",   iconText: "text-cyan-600"   },
    { gradient: "from-pink-50",   border: "border-pink-200",   iconBg: "bg-pink-100",   iconText: "text-pink-600"   },
];

export default function DashboardPage() {
    const router = useRouter();
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [roomName, setRoomName] = useState("");
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState("");

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) { router.push("/signin"); return; }
        fetchRooms(token);
    }, []);

    async function fetchRooms(token: string) {
        setLoading(true);
        setError("");
        try {
            const res = await fetch(`${API_BASE}/rooms`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.status === 401) { router.push("/signin"); return; }
            if (!res.ok) throw new Error(`Server error ${res.status}`);
            const data = await res.json();
            setRooms(data.rooms ?? []);
        } catch (e) {
            console.error("fetchRooms:", e);
            setError(`Could not load rooms — ${e instanceof Error ? e.message : "check the console"}`);
        } finally {
            setLoading(false);
        }
    }

    async function handleCreateRoom() {
        setCreateError("");
        if (!roomName.trim()) { setCreateError("Room name cannot be empty"); return; }
        const token = localStorage.getItem("token");
        if (!token) { router.push("/signin"); return; }
        setCreating(true);
        try {
            const res = await fetch(`${API_BASE}/room`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ name: roomName.trim() }),
            });
            const data = await res.json();
            if (!res.ok) { setCreateError(data.message ?? "Failed to create room"); return; }
            setShowModal(false);
            setRoomName("");
            fetchRooms(token);
        } catch {
            setCreateError("Network error");
        } finally {
            setCreating(false);
        }
    }

    function handleSignOut() {
        localStorage.removeItem("token");
        router.push("/");
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100">
            {/* Nav — matches landing page */}
            <nav className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-2">
                        <Pencil className="w-8 h-8 text-blue-600" />
                        <span className="text-2xl font-bold text-slate-900">LanceDraw</span>
                    </Link>
                    <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 text-slate-600 hover:text-red-600 font-medium transition-colors px-4 py-2 rounded-lg hover:bg-red-50"
                    >
                        <LogOut className="w-4 h-4" />
                        Sign out
                    </button>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
                    <div>
                        <h1 className="text-4xl font-bold text-slate-900">Your Rooms</h1>
                        <p className="text-slate-500 mt-1">Pick up where you left off, or start something new.</p>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
                    >
                        <Plus className="w-5 h-5" />
                        New Room
                    </button>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="flex flex-col items-center justify-center py-32 gap-4 text-slate-400">
                        <Loader2 className="w-10 h-10 animate-spin text-blue-400" />
                        <span className="text-lg">Loading your rooms…</span>
                    </div>
                )}

                {/* Error */}
                {!loading && error && (
                    <div className="text-center py-32">
                        <p className="text-red-500 bg-red-50 border border-red-200 rounded-xl px-6 py-4 inline-block">{error}</p>
                    </div>
                )}

                {/* Empty state */}
                {!loading && !error && rooms.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-32 gap-6">
                        <div className="relative">
                            <div className="absolute inset-0 bg-linear-to-r from-blue-400 to-cyan-400 rounded-2xl blur-2xl opacity-20" />
                            <div className="relative bg-white rounded-2xl border-2 border-dashed border-slate-300 w-64 h-40 flex items-center justify-center">
                                <Pencil className="w-12 h-12 text-slate-300" />
                            </div>
                        </div>
                        <div className="text-center">
                            <p className="text-xl font-semibold text-slate-700">No rooms yet</p>
                            <p className="text-slate-500 mt-1">Create your first room to start drawing.</p>
                        </div>
                        <button
                            onClick={() => setShowModal(true)}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
                        >
                            <Plus className="w-5 h-5" />
                            Create a Room
                        </button>
                    </div>
                )}

                {/* Room grid */}
                {!loading && !error && rooms.length > 0 && (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {rooms.map((room, i) => {
                            const { gradient, border, iconBg, iconText } = CARD_ACCENTS[i % CARD_ACCENTS.length];
                            return (
                                <Link
                                    key={room.id}
                                    href={`/canvas/${room.slug}`}
                                    className={`group bg-linear-to-br ${gradient} to-white rounded-xl border ${border} p-6 hover:shadow-xl transition-all duration-200 hover:-translate-y-1 flex flex-col justify-between gap-6`}
                                >
                                    <div className={`w-12 h-12 rounded-lg ${iconBg} flex items-center justify-center`}>
                                        <Pencil className={`w-6 h-6 ${iconText}`} />
                                    </div>

                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 truncate group-hover:text-blue-600 transition-colors">
                                            {room.slug}
                                        </h3>
                                        <div className="flex items-center gap-1 mt-2 text-sm text-slate-500">
                                            <Clock className="w-3.5 h-3.5" />
                                            {timeAgo(room.createdAt)}
                                        </div>
                                    </div>

                                    <span className="text-sm font-medium text-slate-600 group-hover:text-blue-600 transition-colors flex items-center gap-1">
                                        Open canvas
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                </Link>
                            );
                        })}

                        {/* New room card */}
                        <button
                            onClick={() => setShowModal(true)}
                            className="rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-400 p-6 flex flex-col items-center justify-center gap-3 text-slate-400 hover:text-blue-500 transition-all duration-200 hover:bg-blue-50 hover:-translate-y-1 min-h-45"
                        >
                            <Plus className="w-10 h-10" />
                            <span className="font-medium">New Room</span>
                        </button>
                    </div>
                )}
            </main>

            {/* Create Room Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        onClick={() => { setShowModal(false); setCreateError(""); setRoomName(""); }}
                    />
                    <div className="relative bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md p-8">
                        <button
                            onClick={() => { setShowModal(false); setCreateError(""); setRoomName(""); }}
                            className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <div className="flex items-center gap-2 mb-6">
                            <Pencil className="w-6 h-6 text-blue-600" />
                            <h2 className="text-2xl font-bold text-slate-900">New Room</h2>
                        </div>

                        <label className="block text-sm font-medium text-slate-700 mb-2">Room name</label>
                        <input
                            autoFocus
                            type="text"
                            placeholder="e.g. Product Roadmap"
                            value={roomName}
                            onChange={e => setRoomName(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleCreateRoom()}
                            className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors mb-4"
                        />

                        {createError && (
                            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2 mb-4">
                                {createError}
                            </p>
                        )}

                        <button
                            onClick={handleCreateRoom}
                            disabled={creating}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            {creating ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Creating…</>
                            ) : (
                                <><Plus className="w-4 h-4" /> Create Room</>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}