import {
    diffTime,
    Second,
    Minute,
    Hour,
    Day,
    Month,
    Quarter,
    Year,
    formatDate,
    changeDate,
    changeMonth,
    makeDateRange,
    Timestamp,
    changeYear
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
        expect(
            formatDate(new Date('2020-01-23T00:00:00.000Z'), 'YYYY/M/D')
        ).toBe('2020/1/23');
    });

    describe('change Date', () => {
        it('should handle the Year Delta', () => {
            expect(changeYear(date, 1).toJSON()).toBe(
                '1990-06-04T00:00:00.000Z'
            );
            expect(changeYear(date, -1).toJSON()).toBe(
                '1988-06-04T00:00:00.000Z'
            );
        });

        it('should handle the Month Delta less than a year', () => {
            expect(changeMonth(date, 1).toJSON()).toBe(
                '1989-07-04T00:00:00.000Z'
            );
            expect(changeMonth(date, -1).toJSON()).toBe(
                '1989-05-04T00:00:00.000Z'
            );
        });

        it('should handle the Month Delta greater than a year', () => {
            expect(changeMonth(date, 12).toJSON()).toBe(
                '1990-06-04T00:00:00.000Z'
            );
            expect(changeMonth(date, -12).toJSON()).toBe(
                '1988-06-04T00:00:00.000Z'
            );
        });

        it('should change the date by the specified Unit and Delta', () => {
            const date = new Date('2022-11-27T00:00:00.000Z');

            expect(changeDate(date, Second, 30).toJSON()).toBe(
                '2022-11-27T00:00:30.000Z'
            );
            expect(changeDate(date, Minute, 30).toJSON()).toBe(
                '2022-11-27T00:30:00.000Z'
            );
            expect(changeDate(date, Hour, 1).toJSON()).toBe(
                '2022-11-27T01:00:00.000Z'
            );
            expect(changeDate(date, Day, 1).toJSON()).toBe(
                '2022-11-28T00:00:00.000Z'
            );
            expect(changeDate(date, Month, -1).toJSON()).toBe(
                '2022-10-27T00:00:00.000Z'
            );
            expect(changeDate(date, Year, -1).toJSON()).toBe(
                '2021-11-27T00:00:00.000Z'
            );
        });
    });

    it('should make a Date Range based on a Short Value', () => {
        expect(makeDateRange('2022')).toEqual([
            new Date('2022-01-01T00:00:00.000Z'),
            new Date('2023-01-01T00:00:00.000Z')
        ]);
        expect(makeDateRange('2022-11')).toEqual([
            new Date('2022-11-01T00:00:00.000Z'),
            new Date('2022-12-01T00:00:00.000Z')
        ]);
        expect(makeDateRange('2022-11-27')).toEqual([
            new Date('2022-11-27T00:00:00.000Z'),
            new Date('2022-11-28T00:00:00.000Z')
        ]);
        expect(makeDateRange('2022-11-27T12:30')).toEqual([
            new Date('2022-11-27T12:30:00.000Z'),
            new Date('2022-11-27T12:31:00.000Z')
        ]);
        expect(makeDateRange('2022-11-27T12:30:15')).toEqual([
            new Date('2022-11-27T12:30:15.000Z'),
            new Date('2022-11-27T12:30:16.000Z')
        ]);
    });
});
