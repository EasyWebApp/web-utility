import './polyfill';
import { makeCRC32, makeSHA } from '../source/crypto';

describe('Crypto function', () => {
    it('should create a CRC-32 Hex string', async () => {
        expect(makeCRC32('Web Utility')).toBe('0xa72f2c8e');
    });

    it('should create a SHA Hash string with various algorithms', async () => {
        expect(await makeSHA('Web Utility')).toBe(
            '3d6f5afa692ed347c21444bccf8dcc22ba637d3d'
        );
        expect(await makeSHA('Web Utility', 'SHA-256')).toBe(
            '98e049c68fb717fae9aebb6800863bb4d0093e752872e74e614c291328f33331'
        );
    });
});
