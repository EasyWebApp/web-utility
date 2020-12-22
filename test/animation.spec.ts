import './polyfill';
import { PageVector, durationOf } from '../source/animation';

describe('Animation', () => {
    it('should calculate the Length & Direction of a Page Vector', () => {
        const { length, direction } = new PageVector(
            { x: 0, y: 0 },
            { x: 3, y: 4 }
        );
        expect(length).toBe(5);
        expect(direction).toBe('forward');
    });

    it('should return Millisecond Duration of Transition Style', () => {
        document.body.style.transitionDuration = '0.25s';

        expect(durationOf('transition', document.body)).toBe(250);
    });
});
