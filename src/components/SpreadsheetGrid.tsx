'use client';

import { useState, useCallback, memo } from 'react';
import { Cell as CellType, COLUMNS, ROW_COUNT, makeCellId, PresenceEntry } from '@/types/spreadsheet';
import Cell from './Cell';

interface SpreadsheetGridProps {
    cells: Record<string, CellType>;
    onCellCommit: (cellId: string, value: string, formula?: string) => void;
    activeCell: string | null;
    onCellSelect: (cellId: string) => void;
    presence: Record<string, PresenceEntry>;
    currentUserId: string;
}

const SpreadsheetGrid = memo(function SpreadsheetGrid({
    cells,
    onCellCommit,
    activeCell,
    onCellSelect,
    presence,
    currentUserId,
}: SpreadsheetGridProps) {
    const handleSelect = useCallback((cellId: string) => {
        onCellSelect(cellId);
    }, [onCellSelect]);

    const handleCommit = useCallback(
        (cellId: string, value: string, formula?: string) => {
            onCellCommit(cellId, value, formula);
        },
        [onCellCommit]
    );

    const cellCursors = (() => {
        const map: Record<string, PresenceEntry[]> = {};
        for (const [id, entry] of Object.entries(presence)) {
            if (id === currentUserId || !entry.activeCell) continue;
            if (!map[entry.activeCell]) map[entry.activeCell] = [];
            map[entry.activeCell].push(entry);
        }
        return map;
    })();

    return (
        <div className="overflow-scroll w-full h-full border-t border-l border-slate-200 rounded-lg min-h-0 min-w-0 bg-white shadow-sm">
            <table className="border-collapse table-fixed text-xs min-w-max">
                <thead className="sticky top-0 z-30 bg-slate-50">
                    <tr>
                        <th className="border-b border-r border-slate-200 w-10 min-w-[2.5rem] bg-slate-50 text-slate-400" />
                        {COLUMNS.map((col: string) => (
                            <th
                                key={col}
                                className="border-b border-r border-slate-200 min-w-[100px] h-7 text-center text-slate-700 font-medium bg-slate-100 select-none shadow-sm shadow-slate-200/50"
                            >
                                {col}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: ROW_COUNT }, (_, rowIdx) => {
                        const row = rowIdx + 1;
                        return (
                            <tr key={row}>
                                <td className="border-b border-r border-slate-200 text-center text-slate-500 select-none bg-slate-50 sticky left-0 z-20 text-xs font-medium">
                                    {row}
                                </td>
                                {COLUMNS.map((col: string) => {
                                    const cellId = makeCellId(col, row);
                                    return (
                                        <Cell
                                            key={cellId}
                                            cellId={cellId}
                                            cell={cells[cellId]}
                                            allCells={cells}
                                            onCommit={handleCommit}
                                            isSelected={activeCell === cellId}
                                            onSelect={handleSelect}
                                            otherCursors={cellCursors[cellId] || []}
                                        />
                                    );
                                })}
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
});

export default SpreadsheetGrid;
