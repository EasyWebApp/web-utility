import { isUnsafeNumeric, objectFrom } from './data';

export function parseJSON(raw: string) {
    function parseItem(value: any) {
        if (typeof value === 'string' && /^\d+(-\d{1,2}){1,2}/.test(value)) {
            const date = new Date(value);

            if (!Number.isNaN(+date)) return date;
        }
        return value;
    }

    const value = parseItem(raw);

    if (typeof value !== 'string' || isUnsafeNumeric(value)) return value;

    try {
        return JSON.parse(raw, (key, value) => parseItem(value));
    } catch {
        return raw;
    }
}

export function toJSValue(raw: string) {
    const parsed = parseJSON(raw);

    if (typeof parsed !== 'string') return parsed;

    const number = +parsed;

    return Number.isNaN(number) || number + '' !== parsed ? parsed : number;
}

function readQuoteValue(raw: string) {
    const quote = raw[0];
    const index = raw.indexOf(quote, 1);

    if (index < 0) throw SyntaxError(`A ${quote} is missing`);

    return raw.slice(1, index);
}

function parseRow(row: string, separator = ',') {
    const list = [];

    do {
        let value: string;

        if (row[0] === '"' || row[0] === "'") {
            value = readQuoteValue(row);

            row = row.slice(value.length + 3);
        } else {
            const index = row.indexOf(separator);

            if (index > -1) {
                value = row.slice(0, index);
                row = row.slice(index + 1);
            } else {
                value = row;
                row = '';
            }
        }
        list.push(toJSValue(value.trim()));
    } while (row);

    return list;
}

/**
 * @deprecated Since 4.6.0, please use {@link parseTextTableAsync} or {@link readTextTable}
 *             for better performance with large tables to avoid high memory usage
 */
export function parseTextTable<T extends Record<string, any> = {}>(
    raw: string,
    header?: boolean,
    separator = ','
) {
    const data = raw
        .trim()
        .split(/[\r\n]+/)
        .map(row => parseRow(row, separator));

    return !header
        ? data
        : data.slice(1).map(row => objectFrom(row, data[0]) as T);
}

export const parseTextTableAsync = async <T extends Record<string, any> = {}>(
    raw: string
) => Array.fromAsync(readTextTable<T>(raw[Symbol.iterator]()));

async function* characterStream(
    chunks: Iterable<string> | AsyncIterable<string>
) {
    for await (const chunk of chunks) yield* chunk;
}

async function* parseCharacterStream(
    chars: AsyncGenerator<string>,
    separator = ','
) {
    let inQuote = false;
    let quoteChar = '';
    let prevChar = '';
    let cellBuffer = '';
    let currentRow: any[] = [];

    const completeCell = () => {
        currentRow.push(toJSValue(cellBuffer.trim()));
        cellBuffer = '';
    };

    for await (const char of chars) {
        if (char === '\n' || char === '\r') {
            if (char === '\n' && prevChar === '\r') {
                prevChar = char;
                continue;
            }
            completeCell();

            if (currentRow.length > 1 || currentRow[0]) yield currentRow;

            currentRow = [];
        } else if (
            (char === '"' || char === "'") &&
            !inQuote &&
            cellBuffer.trim() === ''
        ) {
            inQuote = true;
            quoteChar = char;
        } else if (char === quoteChar && inQuote) {
            inQuote = false;
            quoteChar = '';
        } else if (inQuote) {
            cellBuffer += char;
        } else if (char === separator) {
            completeCell();
        } else {
            cellBuffer += char;
        }
        prevChar = char;
    }

    if (cellBuffer || currentRow.length > 0) {
        completeCell();

        if (currentRow.length > 1 || currentRow[0]) yield currentRow;
    }
}

export async function* readTextTable<T extends Record<string, any> = {}>(
    chunks: Iterable<string> | AsyncIterable<string>,
    header?: boolean,
    separator = ','
) {
    let headerRow: string[] | undefined;
    let isFirstRow = true;

    const chars = characterStream(chunks);

    for await (const row of parseCharacterStream(chars, separator))
        if (header && isFirstRow) {
            headerRow = row;
            isFirstRow = false;
        } else
            yield header && headerRow ? (objectFrom(row, headerRow) as T) : row;
}
