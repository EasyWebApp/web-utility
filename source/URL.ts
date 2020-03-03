import { parseJSON } from './data';

export function isXDomain(URI: string) {
    return new URL(URI, document.baseURI).origin !== self.location.origin;
}

export type JSONValue = number | boolean | string | null;

export interface URLData {
    [key: string]: JSONValue | JSONValue[];
}

export function parseURLData(raw = window.location.search) {
    const data = new URLSearchParams(/(?:\?|#)?(\S+)/.exec(raw)[1]);

    return Object.fromEntries(
        [...data.keys()].map(key => {
            const list = data.getAll(key).map(parseJSON);

            return [key, list.length < 2 ? list[0] : list];
        })
    );
}

const DataURI = /^data:(.+?\/(.+?))?(;base64)?,([\s\S]+)/;

export function blobFrom(URI: string) {
    var [_, type, __, base64, data] = DataURI.exec(URI) || [];

    data = base64 ? self.atob(data) : data;

    const aBuffer = new ArrayBuffer(data.length);
    const uBuffer = new Uint8Array(aBuffer);

    for (let i = 0; data[i]; i++) uBuffer[i] = data.charCodeAt(i);

    return new Blob([aBuffer], { type });
}
