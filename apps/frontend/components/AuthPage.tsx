"use client";

import { useState } from 'react';
import { Pencil } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export function AuthPage({ isSignin }: { isSignin: boolean }) {
    const router = useRouter();

    const [name, setName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit() {
        setError("");
        setLoading(true);

        try {
            const endpoint = isSignin ? "/signin" : "/signup";
            const body = isSignin
                ? { username, password }
                : { username, password, name };

            const res = await fetch(`${API_BASE}${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message ?? "Something went wrong");
                return;
            }

            if (isSignin) {
                if (data.token) {
                    localStorage.setItem("token", data.token);
                    router.push("/dashboard");
                } else {
                    setError(data.message ?? "Sign in failed");
                }
            } else {
                const signinRes = await fetch(`${API_BASE}/signin`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, password }),
                });
                const signinData = await signinRes.json();
                
                if (signinData.token) {
                    localStorage.setItem("token", signinData.token);
                    router.push("/dashboard");
                } else {
                    setError(signinData.message ?? "Auto sign-in failed, please sign in manually");
                    router.push("/signin");
                }
            }
        } catch (err) {
            setError("Network error — is the server running?");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-linear-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 p-8">
                    <div className="flex items-center justify-center gap-2 mb-8">
                        <Pencil className="w-8 h-8 text-blue-600" />
                        <span className="text-2xl font-bold text-slate-900">LanceDraw</span>
                    </div>

                    <h1 className="text-3xl font-bold text-center text-slate-900 mb-2">
                        {isSignin ? 'Welcome Back' : 'Create Account'}
                    </h1>
                    <p className="text-center text-slate-600 mb-8">
                        {isSignin ? 'Sign in to continue creating' : 'Join LanceDraw today'}
                    </p>

                    <div className="space-y-4">
                        {!isSignin && (
                            <div>
                                <label className="block text-sm font-medium text-slate-900 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    placeholder="John Doe"
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                                />
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">Email</label>
                            <input
                                type="email"
                                placeholder="you@example.com"
                                value={username}
                                onChange={e => setUsername(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-900 mb-2">Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && handleSubmit()}
                                className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                            />
                        </div>

                        {error && (
                            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">
                                {error}
                            </p>
                        )}

                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-lg transition-colors transform hover:scale-105 mt-6 shadow-lg"
                        >
                            {loading
                                ? (isSignin ? 'Signing in…' : 'Creating account…')
                                : (isSignin ? 'Sign In' : 'Create Account')}
                        </button>
                    </div>

                    <div className="mt-6 text-center text-sm text-slate-600">
                        {isSignin ? (
                            <p>Don't have an account? <Link href="/signup" className="text-blue-600 font-medium cursor-pointer hover:text-blue-700">Sign up</Link></p>
                        ) : (
                            <p>Already have an account? <Link href="/signin" className="text-blue-600 font-medium cursor-pointer hover:text-blue-700">Sign in</Link></p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}