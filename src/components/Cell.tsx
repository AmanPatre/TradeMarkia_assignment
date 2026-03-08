'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { evaluateFormula } from '@/lib/formulas';
import { Cell as CellType } from '@/types/spreadsheet';

interface CellProps {
    cellId: string;
    cell: CellType | undefined;
    allCells: Record<string, CellType>;
    onCommit: (cellId: string, value: string, formula?: string) => void;
    isSelected: boolean;
    onSelect: (cellId: string) => void;
}

export default function Cell({
    cellId,
    cell,
    allCells,
    onCommit,
    isSelected,
    onSelect,
}: CellProps) {
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState('');
    const inputRef = useRef<HTMLInputElement>(null);

    // Focus input when entering edit mode
    useEffect(() => {
        if (editing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [editing]);

    /** Build a flat value-map for formula evaluation */
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
        if (trimmed === (cell?.formula ?? cell?.value ?? '')) return; // no change
        const isFormula = trimmed.startsWith('=');
        onCommit(cellId, isFormula ? '' : trimmed, isFormula ? trimmed : undefined);
    };

    return (
        <td
            className={`border border-gray-800 p-0 min-w-[100px] h-7 relative text-sm select-none
        ${isSelected ? 'ring-2 ring-inset ring-indigo-500 z-10' : 'hover:bg-gray-800/40'}
      `}
            onClick={() => { onSelect(cellId); }}
            onDoubleClick={startEditing}
        >
            {editing ? (
                <input
                    ref={inputRef}
                    className="absolute inset-0 w-full h-full bg-white text-gray-900 px-1.5 text-sm outline-none z-20"
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
                    className="block w-full h-full px-1.5 leading-7 overflow-hidden whitespace-nowrap text-ellipsis text-gray-100"
                >
                    {displayValue}
                </span>
            )}
        </td>
    );
}
