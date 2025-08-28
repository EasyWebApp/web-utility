import '@webcomponents/webcomponentsjs/custom-elements-es5-adapter';
import { TextEncoder, TextDecoder } from 'util';
import { Crypto } from '@peculiar/webcrypto';
import 'intersection-observer';

const polyfill = { TextEncoder, TextDecoder, crypto: new Crypto() };

for (const [key, value] of Object.entries(polyfill))
    Object.defineProperty(globalThis, key, { value });
