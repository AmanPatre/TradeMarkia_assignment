'use client';

import { useState, useCallback, useEffect } from 'react';
import { use } from 'react';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useUser } from '@/context/UserContext';
import { useDocument } from '@/hooks/useDocument';
import { usePresence } from '@/hooks/usePresence';
import SpreadsheetGrid from '@/components/SpreadsheetGrid';
import Presence from '@/components/Presence';
import LoginPage from '@/components/LoginPage';
import Link from 'next/link';
import { PresenceEntry } from '@/types/spreadsheet';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function DocPage({ params }: PageProps) {
    const { id: docId } = use(params);
    const { user, loading } = useUser();

    const [docTitle, setDocTitle] = useState('Loading…');
    const [presence, setPresence] = useState<Record<string, PresenceEntry>>({});

    const { cells, saveStatus, updateCell } = useDocument(docId);

    const setPresenceStable = useCallback((p: Record<string, PresenceEntry>) => {
        setPresence(p);
    }, []);

    usePresence(
        docId,
        user?.uid ?? '',
        user?.name ?? '',
        user?.color ?? '#6366F1',
        setPresenceStable
    );

    useEffect(() => {
        if (!docId) return;
        getDoc(doc(db, 'documents', docId)).then((snap) => {
            if (snap.exists()) setDocTitle(snap.data().title ?? 'Untitled');
        });
    }, [docId]);

    const handleCellCommit = useCallback(
        async (cellId: string, value: string, formula?: string) => {
            if (!user) return;
            await updateCell(cellId, value, formula, user.uid);
            updateDoc(doc(db, 'documents', docId), {
                updatedAt: serverTimestamp(),
            }).catch(() => { });
        },
        [user, docId, updateCell]
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-950 flex items-center justify-center">
                <div className="text-gray-400 animate-pulse">Loading…</div>
            </div>
        );
    }

    if (!user) return <LoginPage />;

    const saveLabel =
        saveStatus === 'saving' ? (
            <span className="text-yellow-400 text-xs">Saving…</span>
        ) : saveStatus === 'saved' ? (
            <span className="text-green-400 text-xs">Saved</span>
        ) : null;

    return (
        <div className="h-screen bg-gray-950 text-white flex flex-col overflow-hidden">
            <header className="flex-none border-b border-gray-800 px-4 py-2 flex items-center gap-4">
                <Link href="/" className="text-gray-400 hover:text-white transition-colors text-sm">
                    ← Back
                </Link>
                <h1 className="font-semibold text-sm flex-1 truncate">{docTitle}</h1>
                <div className="w-16 text-right">{saveLabel}</div>
                <Presence presence={presence} currentUserId={user.uid} />
                <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold uppercase flex-none"
                    style={{ backgroundColor: user.color }}
                    title={user.name}
                >
                    {user.name.charAt(0)}
                </div>
            </header>

            <div className="flex-none px-4 py-1 bg-gray-900 border-b border-gray-800 text-xs text-gray-500">
                Double-click a cell to edit. Start with{' '}
                <code className="text-indigo-400">=</code> for formulas (e.g.{' '}
                <code className="text-indigo-400">=A1+B1</code>,{' '}
                <code className="text-indigo-400">=SUM(A1:A5)</code>)
            </div>

            <div className="flex-1 overflow-hidden p-2">
                <SpreadsheetGrid cells={cells} onCellCommit={handleCellCommit} />
            </div>
        </div>
    );
}
