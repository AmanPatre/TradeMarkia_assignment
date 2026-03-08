'use client';

import { PresenceEntry } from '@/types/spreadsheet';

interface PresenceProps {
    presence: Record<string, PresenceEntry>;
    currentUserId: string;
}

export default function Presence({ presence, currentUserId }: PresenceProps) {
    const others = Object.entries(presence).filter(([id]) => id !== currentUserId);
    const totalCount = Math.max(1, Object.keys(presence).length);

    return (
        <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 hidden sm:inline">Online: {totalCount}</span>
            {others.length > 0 && (
                <div className="flex -space-x-1.5">
                    {others.map(([id, entry]) => (
                        <div
                            key={id}
                            title={entry.name}
                            className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-white text-xs font-bold uppercase select-none shadow-sm"
                            style={{ backgroundColor: entry.color }}
                        >
                            {entry.name.charAt(0)}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
