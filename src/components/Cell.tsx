'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { evaluateFormula } from '@/lib/formulas';
import { Cell as CellType, PresenceEntry } from '@/types/spreadsheet';

interface CellProps {
    cellId: string;
    cell: CellType | undefined;
    allCells: Record<string, CellType>;
    onCommit: (cellId: string, value: string, formula?: string) => void;
    isSelected: boolean;
    onSelect: (cellId: string) => void;
    otherCursors?: PresenceEntry[];
}

export default function Cell({
    cellId,
    cell,
    allCells,
    onCommit,
    isSelected,
    onSelect,
    otherCursors = [],
}: CellProps) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (editing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [editing]);

    const getCellValues = useCallback((): Record<string, string> => {
        const map: Record<string, string> = {};
        for (const [id, c] of Object.entries(allCells)) {
            map[id] = c.formula ? evaluateFormula(c.formula, map) : c.value;
        }
        return map;
    }, [allCells]);

    const displayValue = (() => {
        if (!cell) return '';
        if (cell.formula) {
            const vals = getCellValues();
            return evaluateFormula(cell.formula, vals);
        }
        return cell.value;
    })();

    const startEditing = () => {
        setDraft(cell?.formula ?? cell?.value ?? '');
        setEditing(true);
    };

    const commit = () => {
        setEditing(false);
        const trimmed = draft.trim();
        if (trimmed === (cell?.formula ?? cell?.value ?? '')) return;
        const isFormula = trimmed.startsWith('=');
        onCommit(cellId, isFormula ? '' : trimmed, isFormula ? trimmed : undefined);
    };

    const hasOtherCursors = otherCursors.length > 0;
    const primaryCursor = otherCursors[0];

    return (
        <td
            className={`border-b border-r border-slate-200 p-0 min-w-[100px] h-7 relative text-sm select-none
        ${isSelected ? 'ring-2 ring-inset ring-blue-600 z-20' : 'hover:bg-slate-50'}
      `}
            style={{
                ...(hasOtherCursors && !isSelected && {
                    boxShadow: `inset 0 0 0 2px ${primaryCursor.color}`,
                    zIndex: 10,
                })
            }}
            onClick={() => { onSelect(cellId); }}
            onDoubleClick={startEditing}
        >
            {hasOtherCursors && !isSelected && (
                <div
                    className="absolute -top-5 left-0 px-1.5 py-0.5 text-[10px] font-bold text-white whitespace-nowrap rounded-t-sm z-30 flex gap-1 pointer-events-none"
                    style={{ backgroundColor: primaryCursor.color }}
                >
                    {otherCursors.map(c => c.name).join(', ')}
                </div>
            )}

            {editing ? (
                <input
                    ref={inputRef}
                    className="absolute inset-0 w-full h-full bg-white text-slate-900 px-1.5 text-sm outline-none z-40"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onBlur={commit}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === 'Tab') { e.preventDefault(); commit(); }
                        if (e.key === 'Escape') { setEditing(false); }
                    }}
                />
            ) : (
                <span
                    className="block w-full h-full px-1.5 leading-7 overflow-hidden whitespace-nowrap text-ellipsis text-slate-900"
                >
                    {displayValue}
                </span>
            )}
        </td>
    );
}
