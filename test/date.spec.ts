import {
    diffTime,
    Second,
    Minute,
    Quarter,
    Day,
    Month,
    Year,
    formatDate,
    changeMonth
} from '../source/date';

describe('Date', () => {
    const date = new Date('1989-06-04T00:00:00.000Z');

    describe('Relative time', () => {
        it('should calculate Time based on Gregorian calendar defaultly', () => {
            expect(diffTime(date, new Date(1989, 3, 26))).toEqual(
                expect.objectContaining({ distance: 1, unit: 'M' })
            );
        });

        it('should calculate Time based on Chinese calendar', () => {
            expect(
                diffTime(
                    date,
                    new Date(1989, 3, 15),
                    new Map([
                        ['秒', Second],
                        ['分', Minute],
                        ['刻', Quarter],
                        ['时辰', Quarter * 8],
                        ['日', Day],
                        ['月', Month],
                        ['岁', Year]
                    ])
                )
            ).toEqual(expect.objectContaining({ distance: 2, unit: '月' }));
        });
    });

    it('should format Date according to a Template', () => {
        expect(formatDate(date, 'YYYY/MM/DD')).toBe('1989/06/04');
    });

    describe('change Month', () => {
        it('should handle the Delta less than a year', () => {
            expect(changeMonth(date, 1).toJSON()).toBe(
                '1989-07-04T00:00:00.000Z'
            );
            expect(changeMonth(date, -1).toJSON()).toBe(
                '1989-05-04T00:00:00.000Z'
            );
        });

        it('should handle the Delta greater than a year', () => {
            expect(changeMonth(date, 12).toJSON()).toBe(
                '1990-06-04T00:00:00.000Z'
            );
            expect(changeMonth(date, -12).toJSON()).toBe(
                '1988-06-04T00:00:00.000Z'
            );
        });
    });
});
