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

export function parseTextTable<T = {}>(
    raw: string,
    header?: boolean,
    separator = ','
) {
    const data = raw
        .trim()
        .split(/[\r\n]+/)
        .map(row => {
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
        });

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

export async function* parseTextTableStream<T = {}>(
    chunks: AsyncIterable<string>,
    header?: boolean,
    separator = ','
): AsyncGenerator<T extends {} ? T : any[], void, unknown> {
    let buffer = '';
    let headerRow: any[] | undefined;
    let isFirstRow = true;

    for await (const chunk of chunks) {
        buffer += chunk;
        const lines = buffer.split(/[\r\n]+/);

        // Keep the last line in buffer as it might be incomplete
        // Also check if it contains incomplete quotes
        let lastLine = lines.pop() || '';

        for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine) continue;

            try {
                const parsedRow = parseRow(trimmedLine, separator);

                if (header && isFirstRow) {
                    headerRow = parsedRow;
                    isFirstRow = false;
                    continue;
                }

                if (header && headerRow) {
                    const rowObject = parsedRow.reduce(
                        (object, item, index) => {
                            object[headerRow![index]] = item;
                            return object;
                        },
                        {} as any
                    );
                    yield rowObject as T extends {} ? T : any[];
                } else {
                    yield parsedRow as T extends {} ? T : any[];
                }
                isFirstRow = false;
            } catch (error) {
                // If parsing fails and this might be a partial quoted value,
                // put the line back in buffer
                if (isQuoteIncomplete(line)) {
                    lastLine = line + '\n' + lastLine;
                }
                // Otherwise, skip malformed rows
                continue;
            }
        }

        buffer = lastLine;
    }

    // Process any remaining data in buffer
    if (buffer.trim()) {
        try {
            const parsedRow = parseRow(buffer.trim(), separator);

            if (header && isFirstRow) {
                // Only header row was provided
                return;
            }

            if (header && headerRow) {
                const rowObject = parsedRow.reduce((object, item, index) => {
                    object[headerRow![index]] = item;
                    return object;
                }, {} as any);
                yield rowObject as T extends {} ? T : any[];
            } else {
                yield parsedRow as T extends {} ? T : any[];
            }
        } catch (error) {
            // Skip malformed final row
        }
    }
}
