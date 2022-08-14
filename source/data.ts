export type Constructor<T> = new (...args: any[]) => T;

export type TypeKeys<T, D> = {
    [K in keyof T]: T[K] extends D ? K : never;
}[keyof T];

export type PickData<T> = Omit<T, TypeKeys<T, Function>>;

export type DataKeys<T> = Exclude<keyof T, TypeKeys<T, Function>>;

export function likeNull(value?: any) {
    return !(value != null) || Number.isNaN(value);
}

export function isEmpty(value?: any) {
    return (
        likeNull(value) ||
        (typeof value === 'object' ? !Object.keys(value).length : value === '')
    );
}

export function assertInheritance(Sub: Function, Super: Function) {
    return Sub.prototype instanceof Super;
}

export function byteLength(raw: string) {
    return raw.replace(/[^\u0021-\u007e\uff61-\uffef]/g, 'xx').length;
}

export function toHyphenCase(raw: string) {
    return raw.replace(
        /[A-Z]+|[^A-Za-z][A-Za-z]/g,
        (match, offset) => `${offset ? '-' : ''}${(match[1] || match[0]).toLowerCase()}`
    );
}

export function toCamelCase(raw: string, large = false) {
    return raw.replace(/^[A-Za-z]|[^A-Za-z][A-Za-z]/g, (match, offset) =>
        offset || large
            ? (match[1] || match[0]).toUpperCase()
            : match.toLowerCase()
    );
}

export function uniqueID() {
    return (Date.now() + parseInt((Math.random() + '').slice(2))).toString(36);
}

export function objectFrom<V, K extends string>(values: V[], keys: K[]) {
    return Object.fromEntries(
        values.map((value, index) => [keys[index], value])
    ) as Record<K, V>;
}

export function differ<T>(
    target: Record<string, T>,
    source: Record<string, T>
) {
    const data: Record<string, T> = {};

    for (const key in source)
        if (!(target[key] != null)) data[key] = source[key];

    return data;
}

export type ResultArray<T> = T extends ArrayLike<infer D> ? D[] : T[];

export function likeArray(data?: any): data is ArrayLike<any> {
    if (likeNull(data)) return false;

    const { length } = data;

    return typeof length === 'number' && length >= 0 && ~~length === length;
}

export function makeArray<T>(data?: T) {
    if (data instanceof Array) return data as unknown as ResultArray<T>;

    if (likeNull(data)) return [] as ResultArray<T>;

    if (likeArray(data)) return Array.from(data) as ResultArray<T>;

    return [data] as ResultArray<T>;
}

export function findDeep<T>(
    list: T[],
    subKey: TypeKeys<Required<T>, any[]>,
    handler: (item: T) => boolean
): T[] {
    for (const item of list) {
        if (handler(item)) return [item];

        if (item[subKey] instanceof Array) {
            const result = findDeep(
                item[subKey] as unknown as T[],
                subKey,
                handler
            );
            if (result.length) return [item, ...result];
        }
    }
    return [];
}

export type IndexKey = number | string | symbol;
export type GroupKey<T extends Record<IndexKey, any>> = keyof T | IndexKey;
export type Iteratee<T extends Record<IndexKey, any>> =
    | keyof T
    | ((item: T) => GroupKey<T> | GroupKey<T>[]);

export function groupBy<T extends Record<IndexKey, any>>(
    list: T[],
    iteratee: Iteratee<T>
) {
    const data = {} as Record<GroupKey<T>, T[]>;

    for (const item of list) {
        let keys =
            iteratee instanceof Function ? iteratee(item) : item[iteratee];

        if (!(keys instanceof Array)) keys = [keys];

        for (const key of new Set(
            (keys as GroupKey<T>[]).filter(key => key != null)
        ))
            (data[key] = data[key] || []).push(item);
    }

    return data;
}

export function cache<I, O>(
    executor: (cleaner: () => void, ...data: I[]) => O,
    title: string
) {
    var cacheData: O;

    return function (...data: I[]) {
        if (cacheData != null) return cacheData;

        console.trace(`[Cache] execute: ${title}`);

        cacheData = executor.call(
            this,
            (): void => (cacheData = undefined),
            ...data
        );
        Promise.resolve(cacheData).then(data =>
            console.log(`[Cache] refreshed: ${title} => ${data}`)
        );
        return cacheData;
    };
}

export function parseJSON(raw: string) {
    function parseItem(value: any) {
        if (typeof value === 'string' && value.includes('-')) {
            const date = new Date(value);

            if (!Number.isNaN(+date)) return date;
        }
        return value;
    }

    const value = parseItem(raw);

    if (typeof value !== 'string') return value;

    try {
        return JSON.parse(raw, (key, value) => parseItem(value));
    } catch {
        return raw;
    }
}

export function toJSValue(raw: string) {
    const parsed = parseJSON(raw);

    if (typeof parsed !== 'string') return parsed;

    const number = parseFloat(parsed);

    return Number.isNaN(number) ? parsed : number;
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

                try {
                    value = value.trim();

                    list.push(JSON.parse(value));
                } catch (error) {
                    list.push(value);
                }
            } while (row);

            return list;
        });

    return !header
        ? data
        : data.slice(1).map(row =>
            row.reduce((object, item, index) => {
                object[data[0][index]] = item;

                return object;
            }, {} as T)
        );
}

const CRC_32_Table = Array.from(new Array(256), (_, cell) => {
    for (var j = 0; j < 8; j++)
        if (cell & 1) cell = ((cell >> 1) & 0x7fffffff) ^ 0xedb88320;
        else cell = (cell >> 1) & 0x7fffffff;

    return cell;
});
/**
 * CRC-32 algorithm forked from Bakasen's
 *
 * @see http://blog.csdn.net/bakasen/article/details/6043797
 */
export function makeCRC32(raw: string) {
    var value = 0xffffffff;

    for (const char of raw)
        value =
            ((value >> 8) & 0x00ffffff) ^
            CRC_32_Table[(value & 0xff) ^ char.charCodeAt(0)];

    return '0x' + ((value ^ 0xffffffff) >>> 0).toString(16);
}

if (typeof self === 'object') {
    if ('msCrypto' in globalThis) {
        // @ts-ignore
        const { subtle } = (globalThis.crypto = globalThis.msCrypto as Crypto);

        for (const key in subtle) {
            const origin = subtle[key];

            if (origin instanceof Function)
                subtle[key] = function () {
                    const observer = origin.apply(this, arguments);

                    return new Promise((resolve, reject) => {
                        observer.oncomplete = ({
                            target
                        }: Parameters<FileReader['onload']>[0]) =>
                            resolve(target.result);

                        observer.onabort = observer.onerror = reject;
                    });
                };
        }
    }
    const { crypto } = globalThis;

    if (!crypto?.subtle && crypto?.['webkitSubtle'])
        // @ts-ignore
        crypto.subtle = crypto['webkitSubtle'];
}

export type SHAAlgorithm = 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512';
/**
 * @see https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto/digest#Converting_a_digest_to_a_hex_string
 */
export async function makeSHA(raw: string, algorithm: SHAAlgorithm = 'SHA-1') {
    const buffer = await crypto.subtle.digest(
        algorithm,
        new TextEncoder().encode(raw)
    );
    return Array.from(new Uint8Array(buffer), byte =>
        byte.toString(16).padStart(2, '0')
    ).join('');
}
