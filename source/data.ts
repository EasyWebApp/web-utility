import { Scalar } from './math';

export type Constructor<T> = new (...args: any[]) => T;

export type AbstractClass<T> = abstract new (...args: any[]) => T;

export type Values<T> = Required<T>[keyof T];

export type TypeKeys<T, D> = {
    [K in keyof T]: Required<T>[K] extends D ? K : never;
}[keyof T];

export type PickSingle<T> = T extends infer S | (infer S)[] ? S : T;

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

/**
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/toStringTag}
 */
export const classNameOf = (data: any): string =>
    Object.prototype.toString.call(data).slice(8, -1);

export function assertInheritance(Sub: Function, Super: Function) {
    return Sub.prototype instanceof Super;
}

export function proxyPrototype<T extends object>(
    target: T,
    dataStore: Record<IndexKey, any>,
    setter?: (key: IndexKey, value: any) => any
) {
    const prototype = Object.getPrototypeOf(target);

    const prototypeProxy = new Proxy(prototype, {
        set: (_, key, value, receiver) => {
            if (key in receiver) Reflect.set(prototype, key, value, receiver);
            else dataStore[key] = value;

            setter?.(key, value);

            return true;
        },
        get: (prototype, key, receiver) =>
            key in dataStore
                ? dataStore[key]
                : Reflect.get(prototype, key, receiver)
    });

    Object.setPrototypeOf(target, prototypeProxy);
}

export function isUnsafeNumeric(raw: string) {
    return (
        /^[\d.]+$/.test(raw) &&
        raw.localeCompare(Number.MAX_SAFE_INTEGER + '', undefined, {
            numeric: true
        }) > 0
    );
}

export function byteLength(raw: string) {
    return raw.replace(/[^\u0021-\u007e\uff61-\uffef]/g, 'xx').length;
}

export type HyphenCase<T extends string> = T extends `${infer L}${infer R}`
    ? `${L extends Uppercase<L> ? `-${Lowercase<L>}` : L}${HyphenCase<R>}`
    : T;
export function toHyphenCase(raw: string) {
    return raw.replace(
        /[A-Z]+|[^A-Za-z][A-Za-z]/g,
        (match, offset) =>
            `${offset ? '-' : ''}${(match[1] || match[0]).toLowerCase()}`
    );
}

export type CamelCase<
    Raw extends string,
    Delimiter extends string = '-'
> = Uncapitalize<
    Raw extends `${infer L}${Delimiter}${infer R}`
        ? `${Capitalize<L>}${Capitalize<CamelCase<R>>}`
        : `${Capitalize<Raw>}`
>;
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

/**
 * Encode string to Base64 with Unicode support
 * @param input - String to encode
 * @returns Base64 encoded string
 */
export function base64Encode(input: string): string {
    // Use TextEncoder for proper UTF-8 encoding
    const encoder = new TextEncoder();
    const bytes = encoder.encode(input);

    // Convert bytes to base64
    let binary = '';
    for (let i = 0; i < bytes.length; i++) {
        binary += String.fromCharCode(bytes[i]);
    }

    return btoa(binary);
}

/**
 * Decode Base64 string with Unicode support
 * @param input - Base64 encoded string to decode
 * @returns Decoded Unicode string
 */
export function base64Decode(input: string): string {
    // Decode base64 to binary string
    const binary = atob(input);

    // Convert binary string to bytes
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
    }

    // Use TextDecoder for proper UTF-8 decoding
    const decoder = new TextDecoder();
    return decoder.decode(bytes);
}

export function objectFrom<V, K extends string>(values: V[], keys: K[]) {
    return Object.fromEntries(
        values.map((value, index) => [keys[index], value])
    ) as Record<K, V>;
}

export enum DiffStatus {
    Old = -1,
    Same = 0,
    New = 1
}

export function diffKeys<T extends IndexKey>(oldList: T[], newList: T[]) {
    const map = {} as Record<T, DiffStatus>;

    for (const item of oldList) map[item] = DiffStatus.Old;

    for (const item of newList) {
        map[item] ||= 0;
        map[item] += DiffStatus.New;
    }

    return {
        map,
        group: groupBy(
            Object.entries<DiffStatus>(map),
            ([key, status]) => status
        )
    };
}

export type ResultArray<T> = T extends ArrayLike<infer D> ? D[] : T[];

export function likeArray(data?: any): data is ArrayLike<any> {
    if (likeNull(data)) return false;

    const { length } = data;

    return typeof length === 'number' && length >= 0 && ~~length === length;
}

export type TypedArray =
    | Int8Array
    | Uint8Array
    | Uint8ClampedArray
    | Int16Array
    | Uint16Array
    | Int32Array
    | Uint32Array
    | Float32Array
    | Float64Array
    | BigInt64Array
    | BigUint64Array;

/**
 * @see {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray}
 */
export const isTypedArray = (data: any): data is TypedArray =>
    data instanceof Object.getPrototypeOf(Int8Array);

export function makeArray<T>(data?: T) {
    if (data instanceof Array) return data as unknown as ResultArray<T>;

    if (likeNull(data)) return [] as ResultArray<T>;

    if (likeArray(data)) return Array.from(data) as ResultArray<T>;

    return [data] as ResultArray<T>;
}

export const splitArray = <T>(array: T[], unitLength: number) =>
    array.reduce((grid, item, index) => {
        (grid[~~(index / unitLength)] ||= [])[index % unitLength] = item;

        return grid;
    }, [] as T[][]);

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

export function countBy<T extends Record<IndexKey, any>>(
    list: T[],
    iteratee: Iteratee<T>
) {
    const group = groupBy(list, iteratee);

    const sortedList = Object.entries(group).map(
        ([key, { length }]) => [key, length] as const
    );
    return Object.fromEntries(sortedList);
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

export type TreeNode<
    IK extends string,
    PK extends string,
    CK extends string
> = {
    [key in IK]: number | string;
} & {
    [key in PK]?: number | string;
} & {
    [key in CK]?: TreeNode<IK, PK, CK>[];
};

export function treeFrom<
    IK extends string,
    PK extends string,
    CK extends string,
    N extends TreeNode<IK, PK, CK>
>(
    list: N[],
    idKey = 'id' as IK,
    parentIdKey = 'parentId' as PK,
    childrenKey = 'children' as CK
) {
    list =
        globalThis.structuredClone?.(list) || JSON.parse(JSON.stringify(list));

    const map: Record<string, N> = {};
    const roots: N[] = [];

    for (const item of list) map[item[idKey] as string] = item;

    for (const item of list) {
        const parent = map[item[parentIdKey] as string];

        if (!parent) roots.push(item);
        else {
            parent[childrenKey] ||= [] as TreeNode<IK, PK, CK>[] as N[CK];
            parent[childrenKey].push(item);
        }
    }
    if (!roots[0]) throw new ReferenceError('No root node is found');

    return roots;
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
        Promise.resolve(cacheData).then(
            data => console.log(`[Cache] refreshed: ${title} => ${data}`),
            error => console.error(`[Cache] failed: ${error?.message || error}`)
        );
        return cacheData;
    };
}

export interface IteratorController<V = any, E = Error> {
    next: (value: V) => any;
    error: (error: E) => any;
    complete: () => any;
}

export async function* createAsyncIterator<V, E = Error>(
    executor: (controller: IteratorController<V, E>) => (() => any) | void
) {
    let { promise, resolve, reject } = Promise.withResolvers<V>();

    const doneSymbol = Symbol('done'),
        done = Promise.withResolvers<symbol>();

    const disposer = executor({
        next: value => resolve(value),
        error: error => {
            reject(error);
            // @ts-ignore
            disposer?.();
        },
        complete: () => {
            done.resolve(doneSymbol);
            // @ts-ignore
            disposer?.();
        }
    });

    while (true) {
        const value = await Promise.race([promise, done.promise]);

        if (value === doneSymbol) return;

        yield value as V;

        ({ promise, resolve, reject } = Promise.withResolvers<V>());
    }
}

export async function* mergeStream<T, R = void, N = T>(
    ...sources: (() => AsyncIterator<T, R, N>)[]
) {
    var iterators = sources.map(item => item());

    while (iterators[0]) {
        const dones: number[] = [];

        for (
            let i = 0, iterator: AsyncIterator<T>;
            (iterator = iterators[i]);
            i++
        ) {
            const { done, value } = await iterator.next();

            if (!done) yield value;
            else dones.push(i);
        }
        iterators = iterators.filter((_, i) => !dones.includes(i));
    }
}

export class ByteSize extends Scalar {
    units = ['', 'K', 'M', 'G', 'T', 'P', 'E', 'Z', 'Y'].map((name, i) => ({
        base: 1024 ** i,
        name: name + 'B'
    }));
}
