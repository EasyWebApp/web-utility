import { differ, groupBy, parseTextTable } from '../source/data';

describe('Data', () => {
    it('should return an Object with Diffed Data', () => {
        expect(differ({ a: 1, b: 2 }, { b: 2, c: 3 })).toEqual(
            expect.objectContaining({ c: 3 })
        );
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
});
