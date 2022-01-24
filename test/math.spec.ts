import {
    sum,
    averageOf,
    varianceOf,
    standardDeviationOf,
    hypotenuseOf,
    carryFloat,
    fixFloat
} from '../source/math';

describe('Math functions', () => {
    it('should calculate the sum of all numbers', () => {
        expect(sum(1990, 0, -1)).toBe(1989);
        expect(sum(1, 2, 3)).toBe(6);
        expect(sum(6, -2)).toBe(4);
    });

    it('should calculate the average of all numbers', () => {
        expect(averageOf(2, 4, 8, 16, 32, 64, 128, 256, 512, 1024)).toBe(204.6);
    });

    it('should calculate the variance of all numbers', () => {
        expect(varianceOf([5, 6, 8, 9])).toBe(2.5);
        expect(varianceOf([5, 6, 8, 9], true)).toBe(10 / 3);
    });

    it('should calculate the standard deviation of all numbers', () => {
        expect(standardDeviationOf([5, 6, 8, 9]).toFixed(5)).toBe('1.58114');
        expect(standardDeviationOf([5, 6, 8, 9], true).toFixed(5)).toBe(
            '1.82574'
        );
    });

    it('should calculate the square root of sum of squares', () => {
        expect(hypotenuseOf(1, 2, 3).toFixed(3)).toBe('3.742');
    });

    it('should carry rest bits of a Float Number based on length', () => {
        expect(carryFloat(0.01, 1)).toBe('0.1');
        expect(carryFloat(0.01, 2)).toBe('0.01');
        expect(carryFloat(1.01, 0)).toBe('2');
        expect(carryFloat(0.03001, 3)).toBe('0.031');
        expect(carryFloat(0.049999999999999996, 3)).toBe('0.050');
        expect(carryFloat(1573.1666666666667, 1)).toBe('1573.2');
        expect(carryFloat(7.527726527090811e-7, 7)).toBe('0.0000008');
    });

    it('should fix a Float Number with Banker Rounding Algorithm', () => {
        expect(fixFloat(89, 0)).toBe('89');
        expect(fixFloat(89, 1)).toBe('89.0');
        expect(fixFloat(89.5, 0)).toBe('89');
        expect(fixFloat(89.64, 0)).toBe('90');
        expect(fixFloat(89.64, 1)).toBe('89.6');

        expect(fixFloat(0.8964, 5)).toBe('0.89640');
        expect(fixFloat(0.8964, 3)).toBe('0.896');
        expect(fixFloat(0.8966, 3)).toBe('0.897');
        expect(fixFloat(0.8965, 3)).toBe('0.896');
        expect(fixFloat(0.8955, 3)).toBe('0.896');
        expect(fixFloat(0.89651, 3)).toBe('0.897');
        expect(fixFloat(0.89551, 3)).toBe('0.896');
    });
});
