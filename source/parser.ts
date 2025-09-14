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
        : data.slice(1).map(row => objectFrom(row, data[0]) as T);
}

// 字符流生成器：将字符串块打散为单一字符流
async function* characterStream(
    chunks: AsyncIterable<string>
): AsyncGenerator<string, void, unknown> {
    for await (const chunk of chunks) {
        yield* chunk;
    }
}

// 单元格和行解析生成器：处理字符流以识别完整的单元格和行
async function* parseCharacterStream(
    chars: AsyncGenerator<string>,
    separator = ','
): AsyncGenerator<string[], void, unknown> {
    let cellBuffer = '';
    let currentRow: string[] = [];
    let inQuote = false;
    let quoteChar = '';
    let prevChar = '';

    // 完成单元格的逻辑
    const completeCell = () => {
        currentRow.push(toJSValue(cellBuffer.trim()));
        cellBuffer = '';
    };

    for await (const char of chars) {
        // 处理换行符（跨平台支持）
        if (char === '\n' || char === '\r') {
            // 避免 \r\n 被处理两次：如果当前是 \n 且前一个是 \r，跳过此次处理
            if (char === '\n' && prevChar === '\r') {
                prevChar = char;
                continue;
            }

            // 遇到换行符：完成当前单元格并输出行
            completeCell();

            // 只输出非空行
            if (currentRow.length > 1 || currentRow[0]) yield currentRow;

            // 重置状态
            currentRow = [];
            cellBuffer = '';
        }
        // 处理引号状态
        else if (
            (char === '"' || char === "'") &&
            !inQuote &&
            cellBuffer.trim() === ''
        ) {
            // 进入引号模式：遇到第一个引号且单元格为空
            inQuote = true;
            quoteChar = char;
        } else if (char === quoteChar && inQuote) {
            // 退出引号模式：遇到配对引号
            inQuote = false;
            quoteChar = '';
        } else if (inQuote) {
            // 在引号模式中：所有字符都是单元格内容
            cellBuffer += char;
        } else if (char === separator) {
            // 遇到分隔符：完成当前单元格
            completeCell();
        } else {
            // 普通字符
            cellBuffer += char;
        }

        prevChar = char;
    }

    // 处理最后一行（如果有内容）
    if (cellBuffer || currentRow.length > 0) {
        completeCell();
        if (currentRow.length > 1 || currentRow[0]) yield currentRow;
    }
}

export async function* readTextTable<T = {}>(
    chunks: AsyncIterable<string>,
    header?: boolean,
    separator = ','
): AsyncGenerator<T extends {} ? T : any[], void, unknown> {
    let headerRow: any[] | undefined;
    let isFirstRow = true;

    // 创建字符流并解析
    const chars = characterStream(chunks);

    // 处理每一行
    for await (const row of parseCharacterStream(chars, separator)) {
        if (header && isFirstRow) {
            headerRow = row;
            isFirstRow = false;
        } else {
            yield header && headerRow
                ? (objectFrom(row, headerRow) as T extends {} ? T : any[])
                : (row as T extends {} ? T : any[]);
        }
    }
}
