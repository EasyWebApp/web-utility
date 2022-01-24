import './polyfill';
import {
    isEmpty,
    byteLength,
    differ,
    likeArray,
    makeArray,
    groupBy,
    cache,
    parseJSON,
    parseTextTable,
    makeCRC32,
    makeSHA
} from '../source/data';
import { sleep } from '../source/timer';

describe('Data', () => {
    it('should detect Meaningless Null Values', () => {
        expect(
            [0, false, '', null, undefined, NaN, [], {}].map(isEmpty)
        ).toEqual(
            expect.arrayContaining([
                false,
                false,
                true,
                true,
                true,
                true,
                true,
                true
            ])
        );
    });

    it('should calculate the Byte Length of a String', () => {
        expect(byteLength('123')).toBe(3);

        expect(byteLength('xＸ中')).toBe(5);
    });

    it('should return an Object with Diffed Data', () => {
        expect(differ({ a: 1, b: 2 }, { b: 2, c: 3 })).toEqual(
            expect.objectContaining({ c: 3 })
        );
    });

    it('should detect an Object whether is Array-like or not', () => {
        expect(likeArray('a')).toBe(true);
        expect(likeArray({ 0: 'a' })).toBe(false);
        expect(likeArray({ 0: 'a', length: 1 })).toBe(true);
    });

    it('should make sure the result is an Array', () => {
        expect(makeArray('a')).toStrictEqual(['a']);
        expect(makeArray({ 0: 'a' })).toStrictEqual([{ 0: 'a' }]);
        expect(makeArray({ 0: 'a', length: 1 })).toStrictEqual(['a']);

        const list = [0];
        expect(makeArray(list)).toBe(list);
    });

    describe('Group by', () => {
        it('should handle single Group Key', () => {
            expect(groupBy([{ a: 1 }, { a: 2 }], 'a')).toEqual(
                expect.objectContaining({
                    '1': [{ a: 1 }],
                    '2': [{ a: 2 }]
                })
            );
        });

        it('should handle multiple Group Keys', () => {
            expect(
                groupBy([{ a: [1, 2] }, { a: [2, 3] }, { b: 4 }], ({ a }) => a)
            ).toEqual(
                expect.objectContaining({
                    '1': [{ a: [1, 2] }],
                    '2': [{ a: [1, 2] }, { a: [2, 3] }],
                    '3': [{ a: [2, 3] }]
                })
            );
        });
    });

    describe('Function Cache', () => {
        it('should cache result of a Sync Function', () => {
            const add = cache((_, x: number, y: number) => x + y, 'add');

            expect(add(1, 1)).toBe(2);
            expect(add(1, 2)).toBe(2);
        });

        it('should cache result of an Async Function', async () => {
            const origin = jest.fn(() => Promise.resolve(1));
            const asyncFunc = cache(origin, 'async');

            expect(asyncFunc()).toBeInstanceOf(Promise);
            expect(asyncFunc()).toBe(asyncFunc());
            expect(await asyncFunc()).toBe(1);
            expect(origin).toBeCalledTimes(1);
        });

        it('should renew Cache data manually', async () => {
            const asyncFunc = cache(async (clean, data: any) => {
                setTimeout(clean, 1000);

                return data;
            }, 'cleanable');

            expect(await asyncFunc(1)).toBe(1);
            expect(await asyncFunc(2)).toBe(1);

            await sleep();
            expect(await asyncFunc(3)).toBe(3);
        });
    });

    describe('JSON Parser', () => {
        it('should parse JSON strings within Primitive values', () => {
            expect(parseJSON('1')).toBe(1);
            expect(parseJSON('1x')).toBe('1x');
        });

        it('should parse JSON strings within ISO Date values', () => {
            const { time } = parseJSON('{"time": "2020-01-23T00:00:00.000Z"}');

            expect(time).toBeInstanceOf(Date);
            expect((time as Date).toJSON()).toBe('2020-01-23T00:00:00.000Z');
        });
    });

    describe('Text Table parser', () => {
        it('should parse Simple CSV', () => {
            expect(parseTextTable('1,2,3\n4,5,6')).toEqual(
                expect.arrayContaining([
                    [1, 2, 3],
                    [4, 5, 6]
                ])
            );
        });

        it('should parse Quoted CSV', () => {
            expect(parseTextTable('"a,1","b,2","c,3"')).toEqual(
                expect.arrayContaining([['a,1', 'b,2', 'c,3']])
            );
        });

        it('should parse Mixed CSV', () => {
            expect(parseTextTable('"a,1",2,\'c,3\'')).toEqual(
                expect.arrayContaining([['a,1', 2, 'c,3']])
            );
        });

        it('should parse Table Headers', () => {
            expect(parseTextTable('a,b,c\n1,2,3', true)).toEqual(
                expect.arrayContaining([{ a: 1, b: 2, c: 3 }])
            );
        });
    });

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
