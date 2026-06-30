import 'core-js/stable/typed-array/to-base64';
import 'core-js/stable/typed-array/from-base64';
import 'core-js/stable/typed-array/to-hex';

import '@webcomponents/webcomponentsjs/custom-elements-es5-adapter';
import { TextEncoder, TextDecoder } from 'util';
import { Crypto } from '@peculiar/webcrypto';
import 'intersection-observer';

// util.TextEncoder returns outer-realm Uint8Array instances, which don't share
// the vm-context Uint8Array.prototype patched by core-js above.
// Wrap encode() to re-create the view in the current realm so toBase64() is available.
const { encode } = TextEncoder.prototype;

// @ts-expect-error — cross-realm Uint8Array wrapper; buffer is always a plain ArrayBuffer here
TextEncoder.prototype.encode = function (input?: string): Uint8Array {
    const { buffer, byteOffset, byteLength } = encode.call(this, input);

    return new Uint8Array(buffer, byteOffset, byteLength);
};

const polyfill = { TextEncoder, TextDecoder, crypto: new Crypto() };

for (const [key, value] of Object.entries(polyfill))
    Object.defineProperty(globalThis, key, { value });
