/**
 * Deterministically derive a color hex from a string UID.
 * Returns one of 10 carefully chosen, accessible colors.
 */

const PALETTE = [
    '#EF4444', // red
    '#F97316', // orange
    '#EAB308', // yellow
    '#22C55E', // green
    '#14B8A6', // teal
    '#3B82F6', // blue
    '#8B5CF6', // violet
    '#EC4899', // pink
    '#06B6D4', // cyan
    '#84CC16', // lime
];

export function colorFromUid(uid: string): string {
    let hash = 0;
    for (let i = 0; i < uid.length; i++) {
        hash = (hash * 31 + uid.charCodeAt(i)) >>> 0;
    }
    return PALETTE[hash % PALETTE.length];
}
