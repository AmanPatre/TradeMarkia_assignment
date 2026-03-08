

export interface Cell {
    value: string;
    formula?: string;
    updatedBy: string;
    updatedAt: number;
}


export interface SpreadsheetDocument {
    id: string;
    title: string;
    createdBy: string;
    authorName: string;
    updatedAt: number;
}


export interface PresenceEntry {
    name: string;
    color: string;
    lastActive: number;
    activeCell?: string;
}


export interface AppUser {
    uid: string;
    name: string;
    color: string;
}


export type SaveStatus = 'idle' | 'saving' | 'saved';


export const COLUMNS = Array.from({ length: 26 }, (_, i) =>
    String.fromCharCode(65 + i)
);

export const ROW_COUNT = 50;

export function makeCellId(col: string, row: number): string {
    return `${col}${row}`;
}
