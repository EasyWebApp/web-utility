import './JSDOM';
import { describe, expect, it } from './API';
import {
    isXDomain,
    fileNameOf,
    fileMetaOf,
    parseURLData,
    buildURLData,
    blobFrom
} from '../source/URL';

if (!('MediaStream' in globalThis))
    Object.defineProperty(globalThis, 'MediaStream', {
        configurable: true,
        value: class {}
    });

describe('URL', () => {
    it('should return "true" while an URL is cross domain in current page', () => {
        expect(isXDomain('https://www.google.com/')).toBe(true);
    });

    describe('File metadata', () => {
        it('should infer metadata from a file URL', () => {
            expect(
                fileMetaOf('https://example.com/archive.tar.gz?download=1')
            ).toEqual({
                name: 'archive.tar.gz',
                type: 'application/gzip',
                category: 'application',
                extension: 'gz'
            });
        });

        it('should read metadata from a data URI', () => {
            expect(fileMetaOf('data:text/plain,hello')).toEqual({
                name: '',
                type: 'text/plain',
                category: 'text',
                extension: 'txt'
            });
        });

        it('should read MIME metadata from a Blob', () => {
            expect(
                fileMetaOf(new Blob(['hello'], { type: 'text/plain' }))
            ).toEqual({
                name: '',
                type: 'text/plain',
                category: 'text',
                extension: 'txt'
            });
        });

        it('should use the name and MIME type of a File', () => {
            expect(
                fileMetaOf(
                    new File(['hello'], 'hello.txt', { type: 'text/plain' })
                )
            ).toEqual({
                name: 'hello.txt',
                type: 'text/plain',
                category: 'text',
                extension: 'txt'
            });
        });

        it('should identify a MediaStream', () => {
            expect(fileMetaOf(new MediaStream())).toEqual({
                name: '',
                type: 'stream',
                category: 'stream',
                extension: ''
            });
        });
    });

    describe('File name', () => {
        it('should extract and decode the file name from a URL', () => {
            expect(fileNameOf('https://example.com/path/my%20file.txt')).toBe(
                'my file.txt'
            );
        });

        it('should ignore query and hash parts', () => {
            expect(fileNameOf('/path/file.txt?download=1')).toBe('file.txt');
            expect(fileNameOf('/path/file.txt#preview')).toBe('file.txt');
        });

        it('should return an empty string for paths without a file name', () => {
            expect(fileNameOf('/path/')).toBe('');
            expect(fileNameOf(undefined)).toBe('');
            expect(fileNameOf(null)).toBe('');
        });
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
