export type Constructor<T> = new (...args: any[]) => T;

export type AbstractClass<T> = abstract new (...args: any[]) => T;

export type Values<T> = Required<T>[keyof T];

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
        (match, offset) =>
            `${offset ? '-' : ''}${(match[1] || match[0]).toLowerCase()}`
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

export function splitArray<T>(array: T[], unitLength: number) {
    const list: T[][] = [];

    for (
        let i = 0, current: T[];
        (current = array.slice(unitLength * i, unitLength * ++i)).length;

    )
        list.push(current);

    return list;
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
