import { isXDomain, parseURLData, blobFrom } from '../source/URL';

describe('URL', () => {
    it('should return "true" while an URL is cross domain in current page', () => {
        expect(isXDomain('https://www.google.com/')).toBe(true);
    });

    describe('Parse URL data', () => {
        it('should accept ? or # prefix', () => {
            expect(parseURLData('?')).toBeInstanceOf(Object);
            expect(parseURLData('#')).toBeInstanceOf(Object);
        });

        it('should parse Primitive values', () =>
            expect(parseURLData('?a=A&b=2&c=false')).toEqual(
                expect.objectContaining({
                    a: 'A',
                    b: 2,
                    c: false
                })
            ));

        it('should parse Multiple key to Array', () =>
            expect(parseURLData('?a=1&b=2&b=3')).toEqual(
                expect.objectContaining({ a: 1, b: [2, 3] })
            ));
    });

    describe('Blob', () => {
        it('should create a Blob from a Base64 URI', () => {
            const URI =
                'data:text/plain;base64,' +
                Buffer.from('123').toString('base64');

            const { type, size } = blobFrom(URI);

            expect(type).toBe('text/plain');
            expect(size).toBe(3);
        });
    });
});
