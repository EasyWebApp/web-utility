import { promisify } from '../source/event';

describe('Event', () => {
    it('should convert an End Event to a Promise resolve', async () => {
        var end = promisify('transition', document.body),
            event = new CustomEvent('transitionend');

        document.body.dispatchEvent(event);

        expect(await end).toBe(event);
    });

    it('should convert an Cancel Event to a Promise reject', async () => {
        const end = promisify('animation', document.body),
            event = new CustomEvent('animationcancel');

        document.body.dispatchEvent(event);
        try {
            await end;
        } catch (error) {
            expect(error).toBe(event);
        }
    });
});
