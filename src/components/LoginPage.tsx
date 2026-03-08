'use client';

import { useState } from 'react';
import { useUser } from '@/context/UserContext';

export default function LoginPage() {
    const { signInWithGoogle, signInWithName } = useUser();
    const [name, setName] = useState('');
    const [error, setError] = useState('');

    const handleGuest = () => {
        const trimmed = name.trim();
        if (!trimmed) {
            setError('Please enter a display name.');
            return;
        }
        signInWithName(trimmed);
    };

    return (
        <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl w-full max-w-sm p-8 space-y-8">
                <div className="text-center space-y-1">
                    <div className="text-4xl font-bold text-zinc-100 tracking-tight">
                        Sheet<span className="text-white">Lab</span>
                    </div>
                    <p className="text-zinc-400 text-sm">Real-time collaborative spreadsheets</p>
                </div>

                <button
                    onClick={() => signInWithGoogle().catch(() => setError('Google sign-in failed.'))}
                    className="w-full flex items-center justify-center gap-3 bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-zinc-100 font-medium rounded-lg px-4 py-2.5 transition-colors shadow-sm"
                >
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path
                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            fill="#4285F4"
                        />
                        <path
                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            fill="#34A853"
                        />
                        <path
                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                            fill="#FBBC05"
                        />
                        <path
                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                            fill="#EA4335"
                        />
                    </svg>
                    Continue with Google
                </button>

                <div className="flex items-center gap-3 text-zinc-500 text-sm">
                    <hr className="flex-1 border-zinc-800" />
                    or
                    <hr className="flex-1 border-zinc-800" />
                </div>

                <div className="space-y-3">
                    <input
                        id="guest-name"
                        type="text"
                        placeholder="Your display name"
                        value={name}
                        onChange={(e) => { setName(e.target.value); setError(''); }}
                        onKeyDown={(e) => e.key === 'Enter' && handleGuest()}
                        className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 placeholder-zinc-500 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-zinc-600"
                    />
                    {error && <p className="text-red-500 text-xs">{error}</p>}
                    <button
                        onClick={handleGuest}
                        className="w-full bg-zinc-100 hover:bg-zinc-300 text-zinc-950 font-medium rounded-lg px-4 py-2.5 transition-colors shadow-sm"
                    >
                        Continue as Guest
                    </button>
                </div>
            </div>
        </div>
    );
}
