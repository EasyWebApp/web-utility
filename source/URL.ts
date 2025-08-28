import { isEmpty, likeArray, makeArray } from './data';
import { parseJSON } from './parser';

export const isXDomain = (URI: string) =>
    new URL(URI, document.baseURI).origin !== location.origin;

export type JSONValue = number | boolean | string | null;
export interface URLData<E = unknown> {
    [key: string]: JSONValue | JSONValue[] | URLData | URLData[] | E;
}

export function parseURLData(
    raw = globalThis.location?.search || '',
    toBuiltIn = true
): URLData {
    const rawData = raw
        .split('#')
        .map(URI => {
            const [before, after] = URI.split('?');

            return new URLSearchParams(
                after || (before.includes('=') ? before : '')
            );
        })
        .join('&');
    const data = new URLSearchParams(rawData);

    return Object.fromEntries(
        [...data.keys()].map(key => {
            const list = toBuiltIn
                ? data.getAll(key).map(parseJSON)
                : data.getAll(key);

            return [key, list.length < 2 ? list[0] : list];
        })
    );
}

const stringify = (value: any) =>
    typeof value === 'string'
        ? value
        : likeArray(value)
          ? makeArray(value) + ''
          : JSON.stringify(value);

export function buildURLData(map: string[][] | Record<string, any>) {
    if (!(map instanceof Array)) map = Object.entries(map);

    const list = (map as any[][])
        .map(([key, value]) => !isEmpty(value) && [key, stringify(value)])
        .filter(Boolean);

    return new URLSearchParams(list);
}

export const blobOf = async (URI: string | URL) =>
    (await fetch(URI + '')).blob();

const DataURI = /^data:(.+?\/(.+?))?(;base64)?,([\s\S]+)/;
/**
 * Blob logic forked from axes's
 *
 * @see {@link http://www.cnblogs.com/axes/p/4603984.html}
 */
export function blobFrom(URI: string) {
    var [_, type, __, base64, data] = DataURI.exec(URI) || [];

    data = base64 ? atob(data) : data;

    const aBuffer = Uint8Array.from(data, char => char.charCodeAt(0));

    return new Blob([aBuffer], { type });
}
