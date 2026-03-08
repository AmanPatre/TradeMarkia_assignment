'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    collection,
    doc,
    onSnapshot,
    setDoc,
    serverTimestamp,
    Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Cell, SaveStatus } from '@/types/spreadsheet';

type CellMap = Record<string, Cell>;

interface UseDocumentReturn {
    cells: CellMap;
    saveStatus: SaveStatus;
    updateCell: (cellId: string, value: string, formula: string | undefined, updatedBy: string) => Promise<void>;
}

/**
 * Subscribe to a document's cells subcollection in real-time and expose
 * a stable `updateCell` function that tracks save status.
 */
export function useDocument(docId: string): UseDocumentReturn {
    const [cells, setCells] = useState<CellMap>({});
    const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

    // Real-time listener
    useEffect(() => {
        if (!docId) return;
        const cellsRef = collection(db, 'documents', docId, 'cells');
        const unsub = onSnapshot(cellsRef, (snapshot) => {
            const next: CellMap = {};
            snapshot.forEach((d) => {
                const data = d.data();
                next[d.id] = {
                    value: data.value ?? '',
                    formula: data.formula,
                    updatedBy: data.updatedBy ?? '',
                    updatedAt:
                        data.updatedAt instanceof Timestamp
                            ? data.updatedAt.toMillis()
                            : (data.updatedAt ?? 0),
                };
            });
            setCells(next);
        });
        return unsub;
    }, [docId]);

    // Write a single cell
    const updateCell = useCallback(
        async (
            cellId: string,
            value: string,
            formula: string | undefined,
            updatedBy: string
        ) => {
            setSaveStatus('saving');
            try {
                const cellRef = doc(db, 'documents', docId, 'cells', cellId);
                const payload: Record<string, unknown> = {
                    value,
                    updatedBy,
                    updatedAt: serverTimestamp(),
                };
                if (formula !== undefined) payload.formula = formula;
                await setDoc(cellRef, payload, { merge: true });
                setSaveStatus('saved');
            } catch {
                setSaveStatus('idle');
            }
        },
        [docId]
    );

    return { cells, saveStatus, updateCell };
}
