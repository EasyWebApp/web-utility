import './polyfill';
import { isXDomain, parseURLData, buildURLData, blobFrom } from '../source/URL';

describe('URL', () => {
    it('should return "true" while an URL is cross domain in current page', () => {
        expect(isXDomain('https://www.google.com/')).toBe(true);
    });

    describe('Parse URL data', () => {
        it('should accept History & Hash routes', () => {
            expect(parseURLData('a/b?c=1')).toEqual({ c: 1 });
            expect(parseURLData('a/b?c=1#d/e')).toEqual({ c: 1 });
            expect(parseURLData('a/b?c=1#d/e?f=2')).toEqual({ c: 1, f: 2 });
        });

        it('should parse Primitive values by default', () =>
            expect(
                parseURLData(
                    'a=A&b=2&c=false&d=9007199254740993&e=1031495205251190784&f=2022-1'
                )
            ).toEqual(
                expect.objectContaining({
                    a: 'A',
                    b: 2,
                    c: false,
                    d: '9007199254740993',
                    e: '1031495205251190784',
                    f: new Date('2022-1')
                })
            ));
        it('should parse strings when toBuiltIn parameter is false', () =>
            expect(
                parseURLData(
                    'a=A&b=2&c=false&d=9007199254740993&e=1031495205251190784&f=2022-1',
                    false
                )
            ).toEqual(
                expect.objectContaining({
                    a: 'A',
                    b: '2',
                    c: 'false',
                    d: '9007199254740993',
                    e: '1031495205251190784',
                    f: '2022-1'
                })
            ));

        it('should parse Multiple key to Array', () =>
            expect(parseURLData('/test/example?a=1&b=2&b=3')).toEqual(
                expect.objectContaining({ a: 1, b: [2, 3] })
            ));
    });

    describe('Build URL Data', () => {
        it('should build from an Object or Array', () => {
            expect(buildURLData({ a: 1, b: 2 }) + '').toBe('a=1&b=2');

            expect(
                buildURLData([
                    ['a', 1],
                    ['a', 2],
                    ['b', 3]
                ]) + ''
            ).toBe('a=1&a=2&b=3');
        });

        it('should filter Null Values and handle JSON stringify', () => {
            expect(
                buildURLData({
                    a: 1,
                    b: null,
                    c: '',
                    d: { toJSON: () => 4 },
                    e: [1, 2]
                }) + ''
            ).toBe('a=1&d=4&e=1%2C2');
        });
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
