import { diffTime, formatDate } from '../source/date';

describe('Date', () => {
    describe('Relative time', () => {
        it('should calculate Time based on Gregorian calendar defaultly', () => {
            expect(
                diffTime(new Date(1989, 5, 4), new Date(1989, 3, 26))
            ).toEqual(expect.objectContaining({ distance: 1, unit: 'M' }));
        });

        it('should calculate Time based on Chinese calendar', () => {
            expect(
                diffTime(
                    new Date(1989, 5, 4),
                    new Date(1989, 3, 15),
                    new Map([
                        ['秒', 1000],
                        ['分', 60],
                        ['刻', 15],
                        ['时辰', 8],
                        ['日', 12],
                        ['月', 30],
                        ['岁', 12]
                    ])
                )
            ).toEqual(expect.objectContaining({ distance: 2, unit: '月' }));
        });
    });

    it('should format Date according to a Template', () => {
        expect(formatDate(new Date(1989, 5, 4), 'YYYY/MM/DD')).toBe(
            '1989/06/04'
        );
    });
});
