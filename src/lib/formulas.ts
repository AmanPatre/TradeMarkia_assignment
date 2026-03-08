type CellMap = Record<string, string>;

function toNumber(val: string | undefined): number {
    const n = parseFloat(val ?? '0');
    return isNaN(n) ? 0 : n;
}


function expandRange(range: string): string[] {
    const match = range.match(/^([A-Z])(\d+):([A-Z])(\d+)$/);
    if (!match) return [];

    const [, colStart, rowStart, colEnd, rowEnd] = match;
    const colStartCode = colStart.charCodeAt(0);
    const colEndCode = colEnd.charCodeAt(0);
    const rowStartNum = parseInt(rowStart, 10);
    const rowEndNum = parseInt(rowEnd, 10);

    const ids: string[] = [];
    for (let c = colStartCode; c <= colEndCode; c++) {
        const col = String.fromCharCode(c);
        for (let r = rowStartNum; r <= rowEndNum; r++) {
            ids.push(`${col}${r}`);
        }
    }
    return ids;
}


export function evaluateFormula(formula: string, cells: CellMap): string {
    if (!formula.startsWith('=')) return formula;

    const expr = formula.slice(1).trim();

    const sumMatch = expr.match(/^SUM\(([A-Z]\d+:[A-Z]\d+)\)$/i);
    if (sumMatch) {
        const ids = expandRange(sumMatch[1].toUpperCase());
        const total = ids.reduce((acc, id) => acc + toNumber(cells[id]), 0);
        return String(total);
    }

    const binMatch = expr.match(/^([A-Z]\d+)\s*([\+\-\*\/])\s*([A-Z]\d+)$/i);
    if (binMatch) {
        const left = toNumber(cells[binMatch[1].toUpperCase()]);
        const op = binMatch[2];
        const right = toNumber(cells[binMatch[3].toUpperCase()]);

        switch (op) {
            case '+': return String(left + right);
            case '-': return String(left - right);
            case '*': return String(left * right);
            case '/': return right === 0 ? '#DIV/0!' : String(left / right);
        }
    }

    return '#ERROR!';
}
