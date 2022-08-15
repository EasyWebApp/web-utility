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
