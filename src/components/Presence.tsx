'use client';

import { PresenceEntry } from '@/types/spreadsheet';

interface PresenceProps {
    presence: Record<string, PresenceEntry>;
    currentUserId: string;
}

export default function Presence({ presence, currentUserId }: PresenceProps) {
    const others = Object.entries(presence).filter(([id]) => id !== currentUserId);

    if (others.length === 0) return null;

    return (
        <div className="flex items-center gap-2" title="Active collaborators">
            <span className="text-xs text-gray-400 hidden sm:inline">Online:</span>
            <div className="flex -space-x-1.5">
                {others.map(([id, entry]) => (
                    <div
                        key={id}
                        title={entry.name}
                        className="w-7 h-7 rounded-full border-2 border-gray-900 flex items-center justify-center text-white text-xs font-bold uppercase select-none"
                        style={{ backgroundColor: entry.color }}
                    >
                        {entry.name.charAt(0)}
                    </div>
                ))}
            </div>
        </div>
    );
}
