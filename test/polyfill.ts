import { TextEncoder } from 'util';
import { Crypto } from '@peculiar/webcrypto';
import 'intersection-observer';

globalThis.TextEncoder = TextEncoder;
globalThis.crypto = new Crypto();
