// ─── Cell ────────────────────────────────────────────────────────────────────

export interface Cell {
  value: string;
  formula?: string;
  updatedBy: string;
  updatedAt: number;
}

// ─── Document ────────────────────────────────────────────────────────────────

export interface SpreadsheetDocument {
  id: string;
  title: string;
  createdBy: string;
  authorName: string;
  updatedAt: number;
}

// ─── Presence ────────────────────────────────────────────────────────────────

export interface PresenceEntry {
  name: string;
  color: string;
  lastActive: number;
}

// ─── User ────────────────────────────────────────────────────────────────────

export interface AppUser {
  uid: string;
  name: string;
  color: string;
}

// ─── Save Status ─────────────────────────────────────────────────────────────

export type SaveStatus = 'idle' | 'saving' | 'saved';

// ─── Grid constants ──────────────────────────────────────────────────────────

export const COLUMNS = Array.from({ length: 26 }, (_, i) =>
  String.fromCharCode(65 + i)
); // ['A', ..., 'Z']

export const ROW_COUNT = 50;

export function makeCellId(col: string, row: number): string {
  return `${col}${row}`;
}
