import { isUnsafeNumeric } from './data';

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

export function parseTextTable<T = {}>(
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
        : data.slice(1).map(
              row =>
                  row.reduce((object, item, index) => {
                      object[data[0][index]] = item;

                      return object;
                  }, {}) as T
          );
}

function isQuoteIncomplete(buffer: string): boolean {
    // Check if buffer contains an unmatched opening quote
    let inQuote = false;
    let quote = '';

    for (let i = 0; i < buffer.length; i++) {
        const char = buffer[i];
        if ((char === '"' || char === "'") && !inQuote) {
            inQuote = true;
            quote = char;
        } else if (char === quote && inQuote) {
            inQuote = false;
            quote = '';
        }
    }

    return inQuote;
}

export async function* readTextTable<T = {}>(
    chunks: AsyncIterable<string>,
    header?: boolean,
    separator = ','
): AsyncGenerator<T extends {} ? T : any[], void, unknown> {
    let buffer = '';
    let headerRow: any[] | undefined;
    let isFirstRow = true;

    const makeObject = (parsedRow: string[]) =>
        parsedRow.reduce((object, item, index) => {
            object[headerRow![index]] = item;
            return object;
        }, {} as T);

    for await (const chunk of chunks) {
        buffer += chunk;
    }

    // Add newline at the end to ensure unified processing
    // 在数据末尾添加换行符，确保所有数据都通过统一的处理逻辑处理，避免特殊处理
    if (!buffer.endsWith('\n') && !buffer.endsWith('\r')) {
        buffer += '\n';
    }

    // Process buffer character by character to find complete rows
    let rowStart = 0;
    let inQuote = false;
    let quoteChar = '';

    for (let i = 0; i < buffer.length; i++) {
        const char = buffer[i];

        // Handle quote state
        if ((char === '"' || char === "'") && !inQuote) {
            inQuote = true;
            quoteChar = char;
        } else if (char === quoteChar && inQuote) {
            inQuote = false;
            quoteChar = '';
        }

        // Check for row ending (newline) when not in quotes
        if (!inQuote && (char === '\n' || char === '\r')) {
            const rowData = buffer.slice(rowStart, i).trim();
            if (rowData) {
                const parsedRow = parseRow(rowData, separator);

                if (header && isFirstRow) {
                    headerRow = parsedRow;
                    isFirstRow = false;
                } else {
                    yield header && headerRow
                        ? (makeObject(parsedRow) as T extends {} ? T : any[])
                        : (parsedRow as T extends {} ? T : any[]);
                }
            }

            // Skip additional newline characters
            while (
                i + 1 < buffer.length &&
                (buffer[i + 1] === '\n' || buffer[i + 1] === '\r')
            ) {
                i++;
            }
            rowStart = i + 1;
        }
    }
}
