import {
    diffTime,
    Second,
    Minute,
    Quarter,
    Day,
    Month,
    Year,
    formatDate,
    changeMonth,
    Timestamp
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
            class ChineseTimestamp extends Timestamp {
                units = [
                    { base: Second, name: '秒' },
                    { base: Minute, name: '分' },
                    { base: Quarter, name: '刻' },
                    { base: Quarter * 8, name: '时辰' },
                    { base: Day, name: '日' },
                    { base: Month, name: '月' },
                    { base: Year, name: '岁' }
                ];
            }
            expect(
                ChineseTimestamp.distanceOf(
                    +date,
                    +new Date(1989, 3, 15)
                ).toShortString()
            ).toBe('2 月');
        });
    });

    it('should format Date according to a Template', () => {
        expect(formatDate(date, 'YY/MM/DD')).toBe('89/06/04');

        expect(formatDate(new Date(2020, 0, 23), 'YYYY/M/D')).toBe('2020/1/23');
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
