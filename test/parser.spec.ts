import { parseJSON, toJSValue, parseTextTable } from '../source/parser';

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
            expect(parseTextTable('a,b,c\n1,2,3', true)).toEqual([
                { a: 1, b: 2, c: 3 }
            ]);
        });
    });
});
