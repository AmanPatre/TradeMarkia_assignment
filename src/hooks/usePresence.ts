'use client';

import { useEffect } from 'react';
import {
    collection,
    doc,
    setDoc,
    onSnapshot,
    deleteDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { PresenceEntry } from '@/types/spreadsheet';

const HEARTBEAT_INTERVAL = 20_000; // 20 s
const STALE_THRESHOLD = 60_000; // 60 s — treat as offline

/**
 * Manages the current user's presence heartbeat and subscribes to all
 * other collaborators in the document.
 */
export function usePresence(
    docId: string,
    userId: string,
    name: string,
    color: string,
    setPresence: (p: Record<string, PresenceEntry>) => void
): void {
    // ── Heartbeat ──────────────────────────────────────────────────────────────
    useEffect(() => {
        if (!docId || !userId) return;

        const presRef = doc(db, 'documents', docId, 'presence', userId);

        const write = () => {
            setDoc(presRef, { name, color, lastActive: Date.now() }, { merge: true }).catch(
                () => { }
            );
        };

        write();
        const timer = setInterval(write, HEARTBEAT_INTERVAL);

        return () => {
            clearInterval(timer);
            deleteDoc(presRef).catch(() => { });
        };
    }, [docId, userId, name, color]);

    // ── Subscribe to presence collection ──────────────────────────────────────
    useEffect(() => {
        if (!docId) return;
        const presCol = collection(db, 'documents', docId, 'presence');
        const unsub = onSnapshot(presCol, (snapshot) => {
            const now = Date.now();
            const active: Record<string, PresenceEntry> = {};
            snapshot.forEach((d) => {
                const data = d.data() as PresenceEntry;
                if (now - (data.lastActive ?? 0) < STALE_THRESHOLD) {
                    active[d.id] = data;
                }
            });
            setPresence(active);
        });
        return unsub;
    }, [docId, setPresence]);
}
