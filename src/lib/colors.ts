const PALETTE = [
    '#EF4444',
    '#F97316',
    '#EAB308',
    '#22C55E',
    '#14B8A6',
    '#3B82F6',
    '#8B5CF6',
    '#EC4899',
    '#06B6D4',
    '#84CC16',
];

export function colorFromUid(uid: string): string {
    let hash = 0;
    for (let i = 0; i < uid.length; i++) {
        hash = (hash * 31 + uid.charCodeAt(i)) >>> 0;
    }
    return PALETTE[hash % PALETTE.length];
}
