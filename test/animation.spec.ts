import { durationOf } from '../source';

describe('Animation', () => {
    it('should return Millisecond Duration of Transition Style', () => {
        document.body.style.transitionDuration = '0.25s';

        expect(durationOf('transition', document.body)).toBe(250);
    });
});
