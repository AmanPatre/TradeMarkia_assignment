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
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-gray-400 animate-pulse">Loading…</div>
      </div>
    );
  }

  if (!user) return <LoginPage />;

  const fmt = (ms: number) => (ms ? new Date(ms).toLocaleString() : '—');

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="text-xl font-bold tracking-tight">
          Sheet<span className="text-indigo-400">Lab</span>
        </div>
        <div className="flex items-center gap-4">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold uppercase"
            style={{ backgroundColor: user.color }}
            title={user.name}
          >
            {user.name.charAt(0)}
          </div>
          <span className="text-gray-400 text-sm hidden sm:inline">{user.name}</span>
          <button
            onClick={signOut}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
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
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors"
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
              className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={createDocument}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg px-4 py-2 transition-colors"
            >
              Create
            </button>
            <button
              onClick={() => setCreating(false)}
              className="text-gray-400 hover:text-white text-sm px-3 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        {docs.length === 0 ? (
          <p className="text-gray-500 text-sm">No spreadsheets yet. Create one above!</p>
        ) : (
          <div className="divide-y divide-gray-800 border border-gray-800 rounded-xl overflow-hidden">
            {docs.map((d) => (
              <Link
                key={d.id}
                href={`/doc/${d.id}`}
                className="flex items-center justify-between px-5 py-4 bg-gray-900 hover:bg-gray-800 transition-colors group"
              >
                <div className="space-y-0.5">
                  <div className="font-medium text-white group-hover:text-indigo-300 transition-colors">
                    {d.title}
                  </div>
                  <div className="text-xs text-gray-500">by {d.authorName}</div>
                </div>
                <div className="text-xs text-gray-500 text-right">
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
