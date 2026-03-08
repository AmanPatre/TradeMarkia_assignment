'use client';

import { useState, useCallback, memo } from 'react';
import { Cell as CellType, COLUMNS, ROW_COUNT, makeCellId } from '@/types/spreadsheet';
import Cell from './Cell';

interface SpreadsheetGridProps {
    cells: Record<string, CellType>;
    onCellCommit: (cellId: string, value: string, formula?: string) => void;
}

const SpreadsheetGrid = memo(function SpreadsheetGrid({
    cells,
    onCellCommit,
}: SpreadsheetGridProps) {
    const [selected, setSelected] = useState<string | null>(null);

    const handleSelect = useCallback((cellId: string) => {
        setSelected(cellId);
    }, []);

    const handleCommit = useCallback(
        (cellId: string, value: string, formula?: string) => {
            onCellCommit(cellId, value, formula);
        },
        [onCellCommit]
    );

    return (
        <div className="overflow-auto flex-1 border border-gray-800 rounded-lg">
            <table className="border-collapse table-fixed text-xs">
                <thead className="sticky top-0 z-30 bg-gray-900">
                    <tr>
                        {/* Row-number header corner */}
                        <th className="border border-gray-700 w-10 min-w-[2.5rem] bg-gray-900 text-gray-500" />
                        {COLUMNS.map((col: string) => (
                            <th
                                key={col}
                                className="border border-gray-700 min-w-[100px] h-7 text-center text-gray-300 font-medium bg-gray-850 select-none"
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
                                {/* Row number */}
                                <td className="border border-gray-700 text-center text-gray-500 select-none bg-gray-900 sticky left-0 z-20 text-xs">
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
                                            isSelected={selected === cellId}
                                            onSelect={handleSelect}
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
