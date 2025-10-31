import 'core-js/actual/array/from-async';
import { ReadableStream } from 'stream/web';

import {
    parseJSON,
    toJSValue,
    parseTextTable,
    readTextTable,
    stringifyTextTable
} from '../source/parser';

describe('Data String Parser', () => {
    describe('JSON Parser', () => {
        it('should parse JSON strings within Primitive values', () => {
            expect(parseJSON('1')).toBe(1);
            expect(parseJSON('9007199254740993')).toBe('9007199254740993');
            expect(parseJSON('1031495205251190784')).toBe(
                '1031495205251190784'
            );
            expect(parseJSON('1x')).toBe('1x');
            expect(parseJSON('0xFF')).toBe('0xFF');
            expect(parseJSON('1989-')).toBe('1989-');
        });

        it('should parse JSON strings within ISO Date values', () => {
            const { time } = parseJSON('{"time": "2020-01-23T00:00:00.000Z"}');

            expect(time).toBeInstanceOf(Date);
            expect((time as Date).toJSON()).toBe('2020-01-23T00:00:00.000Z');
        });
    });

    it('should parse a String to a Primitive value or JS object', () => {
        expect(toJSValue('1')).toBe(1);
        expect(toJSValue('true')).toBe(true);
        expect(toJSValue('1989-06-04')).toStrictEqual(new Date('1989-06-04'));
    });

    describe('Text Table parser', () => {
        it('should stringify Text Table', () => {
            const data = [
                { a: 1, b: 'text', c: true },
                { a: 2, b: 'more text', c: false }
            ];
            expect(stringifyTextTable(data)).toBe(
                'a,b,c\n1,"text",true\n2,"more text",false'
            );
        });

        it('should parse Simple CSV', () => {
            expect(parseTextTable('1,2,3\n4,5,6')).toEqual([
                [1, 2, 3],
                [4, 5, 6]
            ]);
        });

        it('should parse Quoted CSV', () => {
            expect(parseTextTable('"a,1","b,2","c,3"')).toEqual([
                ['a,1', 'b,2', 'c,3']
            ]);
        });

        it('should parse Mixed CSV', () => {
            expect(parseTextTable('"a,1",2,\'c,3\'')).toEqual([
                ['a,1', 2, 'c,3']
            ]);
        });

        it('should parse Table Headers', () => {
            expect(
                parseTextTable<Record<'a' | 'b' | 'c', number>>(
                    'a,b,c\n1,2,3',
                    true
                )
            ).toEqual([{ a: 1, b: 2, c: 3 }]);
        });
    });

    describe('Text Table Stream parser', () => {
        it('should parse Simple CSV stream', async () => {
            const chunks = ReadableStream.from(['1,2,3\n', '4,5,6']);

            const results = await Array.fromAsync(readTextTable(chunks));

            expect(results).toEqual([
                [1, 2, 3],
                [4, 5, 6]
            ]);
        });

        it('should parse Quoted CSV stream', async () => {
            const chunks = ReadableStream.from(['"a,1","b,2",', '"c,3"']);

            const results = await Array.fromAsync(readTextTable(chunks));

            expect(results).toEqual([['a,1', 'b,2', 'c,3']]);
        });

        it('should parse Mixed CSV stream', async () => {
            const chunks = ReadableStream.from(['"a,1",2,', "'c,3'"]);

            const results = await Array.fromAsync(readTextTable(chunks));

            expect(results).toEqual([['a,1', 2, 'c,3']]);
        });

        it('should parse Table Headers in stream', async () => {
            const chunks = ReadableStream.from(['a,b,c\n', '1,2,3']);
            const results = await Array.fromAsync(
                readTextTable<Record<'a' | 'b' | 'c', number>>(chunks, true)
            );
            expect(results).toEqual([{ a: 1, b: 2, c: 3 }]);
        });

        it('should handle chunk boundaries that split rows', async () => {
            const chunks = ReadableStream.from(['1,2', ',3\n4,5', ',6\n7,8,9']);

            const results = await Array.fromAsync(readTextTable(chunks));

            expect(results).toEqual([
                [1, 2, 3],
                [4, 5, 6],
                [7, 8, 9]
            ]);
        });

        it('should handle multiple rows in single chunk', async () => {
            const chunks = ReadableStream.from(['1,2,3\n4,5,6\n7,8,9']);

            const results = await Array.fromAsync(readTextTable(chunks));

            expect(results).toEqual([
                [1, 2, 3],
                [4, 5, 6],
                [7, 8, 9]
            ]);
        });

        it('should handle empty chunks and lines', async () => {
            const chunks = ReadableStream.from([
                '1,2,3\n',
                '',
                '\n4,5,6\n',
                '\n'
            ]);
            const results = await Array.fromAsync(readTextTable(chunks));

            expect(results).toEqual([
                [1, 2, 3],
                [4, 5, 6]
            ]);
        });

        it('should handle different separators', async () => {
            const chunks = ReadableStream.from(['1;2;3\n', '4;5;6']);
            const results = await Array.fromAsync(
                readTextTable(chunks, false, ';')
            );
            expect(results).toEqual([
                [1, 2, 3],
                [4, 5, 6]
            ]);
        });

        it('should handle quoted values with complex separators', async () => {
            const chunks = ReadableStream.from(['"a,bc",2,', '3\n"d,ef",4,5']);

            const results = await Array.fromAsync(readTextTable(chunks));

            expect(results).toEqual([
                ['a,bc', 2, 3],
                ['d,ef', 4, 5]
            ]);
        });

        it('should handle different newline formats (Windows CRLF)', async () => {
            const chunks = ReadableStream.from(['1,2,3\r\n', '4,5,6\r\n']);

            const results = await Array.fromAsync(readTextTable(chunks));

            expect(results).toEqual([
                [1, 2, 3],
                [4, 5, 6]
            ]);
        });

        it('should handle mixed newline formats', async () => {
            const chunks = ReadableStream.from([
                '1,2,3\r\n4,5,6\n',
                '7,8,9\r\n'
            ]);
            const results = await Array.fromAsync(readTextTable(chunks));

            expect(results).toEqual([
                [1, 2, 3],
                [4, 5, 6],
                [7, 8, 9]
            ]);
        });

        it('should handle old Mac newline formats (\\r only)', async () => {
            const chunks = ReadableStream.from(['1,2,3\r', '4,5,6\r']);

            const results = await Array.fromAsync(readTextTable(chunks));

            expect(results).toEqual([
                [1, 2, 3],
                [4, 5, 6]
            ]);
        });
    });
});
