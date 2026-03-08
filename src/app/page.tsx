'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useUser } from '@/context/UserContext';
import LoginPage from '@/components/LoginPage';
import { SpreadsheetDocument } from '@/types/spreadsheet';
import Link from 'next/link';

export default function Dashboard() {
  const { user, loading, signOut } = useUser();
  const [docs, setDocs] = useState<SpreadsheetDocument[]>([]);
  const [creating, setCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'documents'), orderBy('updatedAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const list: SpreadsheetDocument[] = snap.docs.map((d) => {
        const data = d.data();
        return {
          id: d.id,
          title: data.title ?? 'Untitled',
          createdBy: data.createdBy ?? '',
          authorName: data.authorName ?? 'Unknown',
          updatedAt:
            data.updatedAt instanceof Timestamp
              ? data.updatedAt.toMillis()
              : (data.updatedAt ?? 0),
        };
      });
      setDocs(list);
    });
    return unsub;
  }, []);

  const createDocument = useCallback(async () => {
    if (!user) return;
    const title = newTitle.trim() || 'Untitled Spreadsheet';
    await addDoc(collection(db, 'documents'), {
      title,
      createdBy: user.uid,
      authorName: user.name,
      updatedAt: serverTimestamp(),
    });
    setNewTitle('');
    setCreating(false);
  }, [user, newTitle]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-zinc-500 animate-pulse">Loading…</div>
      </div>
    );
  }

  if (!user) return <LoginPage />;

  const fmt = (ms: number) => (ms ? new Date(ms).toLocaleString() : '—');

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-zinc-800 px-6 py-4 flex items-center justify-between">
        <div className="text-xl font-bold tracking-tight">
          Sheet<span className="text-zinc-400">Lab</span>
        </div>
        <div className="flex items-center gap-4">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold uppercase"
            style={{ backgroundColor: user.color }}
            title={user.name}
          >
            {user.name.charAt(0)}
          </div>
          <span className="text-zinc-400 text-sm hidden sm:inline">{user.name}</span>
          <button
            onClick={signOut}
            className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">My Documents</h1>
          <button
            onClick={() => setCreating(true)}
            className="bg-zinc-100 hover:bg-zinc-300 text-zinc-900 text-sm font-medium rounded-lg px-4 py-2 transition-colors"
          >
            + New Spreadsheet
          </button>
        </div>

        {creating && (
          <div className="flex gap-3">
            <input
              autoFocus
              type="text"
              placeholder="Spreadsheet title…"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && createDocument()}
              className="flex-1 bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600"
            />
            <button
              onClick={createDocument}
              className="bg-zinc-100 hover:bg-zinc-300 text-zinc-900 text-sm font-medium rounded-lg px-4 py-2 transition-colors"
            >
              Create
            </button>
            <button
              onClick={() => setCreating(false)}
              className="text-zinc-400 hover:text-white text-sm px-3 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        {docs.length === 0 ? (
          <p className="text-zinc-500 text-sm">No spreadsheets yet. Create one above!</p>
        ) : (
          <div className="divide-y divide-zinc-800 border border-zinc-800 rounded-xl overflow-hidden">
            {docs.map((d) => (
              <Link
                key={d.id}
                href={`/doc/${d.id}`}
                className="flex items-center justify-between px-5 py-4 bg-zinc-900 hover:bg-zinc-800 transition-colors group"
              >
                <div className="space-y-0.5">
                  <div className="font-medium text-white group-hover:text-zinc-300 transition-colors">
                    {d.title}
                  </div>
                  <div className="text-xs text-zinc-500">by {d.authorName}</div>
                </div>
                <div className="text-xs text-zinc-500 text-right">
                  <div>Last modified</div>
                  <div>{fmt(d.updatedAt)}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
