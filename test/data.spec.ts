import {
    likeNull,
    isEmpty,
    classNameOf,
    assertInheritance,
    byteLength,
    toHyphenCase,
    toCamelCase,
    objectFrom,
    DiffStatus,
    diffKeys,
    likeArray,
    makeArray,
    splitArray,
    findDeep,
    groupBy,
    cache,
    mergeStream,
    countBy,
    isTypedArray
} from '../source/data';
import { sleep } from '../source/timer';

describe('Data', () => {
    it('should detect Meaningless Null-like Values', () => {
        expect(
            [0, false, '', null, undefined, NaN, [], {}].map(likeNull)
        ).toEqual([false, false, false, true, true, true, false, false]);
    });

    it('should detect Meaningless Empty Values', () => {
        expect(
            [0, false, '', null, undefined, NaN, [], {}].map(isEmpty)
        ).toEqual([false, false, true, true, true, true, true, true]);
    });

    it('should return the Class Name of an object', () => {
        class NewObject {}

        expect(classNameOf(new NewObject())).toBe('Object');

        expect(classNameOf(new URLSearchParams(''))).toBe('URLSearchParams');
    });

    it('should detect the inheritance of Sub & Super classes', () => {
        class A {}
        class B extends A {}
        class C extends B {}

        expect(assertInheritance(C, A)).toBeTruthy();
    });

    it('should calculate the Byte Length of a String', () => {
        expect(byteLength('123')).toBe(3);

        expect(byteLength('xＸ中')).toBe(5);
    });

    it('should convert a Camel-case String to Hyphen-case', () => {
        expect(toHyphenCase('smallCamel')).toBe('small-camel');
        expect(toHyphenCase('LargeCamel')).toBe('large-camel');
        expect(toHyphenCase('With space')).toBe('with-space');
        expect(toHyphenCase('With Space')).toBe('with-space');
        expect(toHyphenCase('with space')).toBe('with-space');
        expect(toHyphenCase('with Space')).toBe('with-space');
    });

    it('should convert a Hyphen-case String to Camel-case', () => {
        expect(toCamelCase('small-camel')).toBe('smallCamel');
        expect(toCamelCase('large-camel', true)).toBe('LargeCamel');
        expect(toCamelCase('Small Camel')).toBe('smallCamel');
    });

    it('should build an Object with Key & Value arrays', () => {
        expect(objectFrom([1, '2'], ['x', 'y'])).toStrictEqual({
            x: 1,
            y: '2'
        });
    });

    it('should find out Old, Same & New keys from 2 keys arrays', () => {
        expect(diffKeys(['a', 'b'], ['b', 'c'])).toEqual({
            map: { a: DiffStatus.Old, b: DiffStatus.Same, c: DiffStatus.New },
            group: {
                [DiffStatus.Old]: [['a', DiffStatus.Old]],
                [DiffStatus.Same]: [['b', DiffStatus.Same]],
                [DiffStatus.New]: [['c', DiffStatus.New]]
            }
        });
    });

    it('should detect an Object whether is Array-like or not', () => {
        expect(likeArray(NaN)).toBe(false);
        expect(likeArray('a')).toBe(true);
        expect(likeArray({ 0: 'a' })).toBe(false);
        expect(likeArray({ 0: 'a', length: 1 })).toBe(true);
    });

    it('should detect an Object whether is TypedArray or not', () => {
        expect(isTypedArray([])).toBe(false);
        expect(isTypedArray(new Uint32Array())).toBe(true);
    });

    it('should make sure the result is an Array', () => {
        expect(makeArray()).toStrictEqual([]);
        expect(makeArray('a')).toStrictEqual(['a']);
        expect(makeArray({ 0: 'a' })).toStrictEqual([{ 0: 'a' }]);
        expect(makeArray({ 0: 'a', length: 1 })).toStrictEqual(['a']);

        const list = [0];
        expect(makeArray(list)).toBe(list);
    });

    it('should split an Array into several arrays with Unit Size', () => {
        expect(splitArray([1, 2, 3, 4, 5, 6], 3)).toEqual([
            [1, 2, 3],
            [4, 5, 6]
        ]);
        expect(splitArray([1, 2, 3, 4, 5, 6, 7], 3)).toEqual([
            [1, 2, 3],
            [4, 5, 6],
            [7]
        ]);
    });

    it('should find data in Nested Object Array', () => {
        const data = [
            { name: 'a' },
            { name: 'b', list: [{ name: 'c' }] },
            { name: 'd' }
        ];

        expect(
            findDeep(data, 'list', ({ name }) => name === 'c')
        ).toStrictEqual([
            {
                name: 'b',
                list: [{ name: 'c' }]
            },
            { name: 'c' }
        ]);
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
                groupBy(
                    [{ a: [1, 2] }, { a: [2, 3] }, { b: 4 }],
                    ({ a = [] }) => a
                )
            ).toEqual(
                expect.objectContaining({
                    '1': [{ a: [1, 2] }],
                    '2': [{ a: [1, 2] }, { a: [2, 3] }],
                    '3': [{ a: [2, 3] }]
                })
            );
        });
    });

    describe('Count by', () => {
        it('should handle a simple Group Key', () => {
            expect(countBy([{ a: 1 }, { a: 1 }], 'a')).toEqual(
                expect.objectContaining({ '1': 2 })
            );
        });

        it('should handle a custom Group Key', () => {
            expect(
                countBy(
                    [{ date: '1989-04-26' }, { date: '1989-06-04' }],
                    ({ date }) => new Date(date).getFullYear()
                )
            ).toEqual(expect.objectContaining({ '1989': 2 }));
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

    it('should merge some Async Generators into one', async () => {
        const list: number[] = [],
            stream = mergeStream(
                async function* () {
                    yield* [1, 3];
                },
                async function* () {
                    yield* [2, 4, 5];
                }
            );
        for await (const item of stream) list.push(item);

        expect(list).toEqual([1, 2, 3, 4, 5]);
    });
});
