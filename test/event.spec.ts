import './polyfill';
import { delegate, promisify } from '../source/event';

describe('Event', () => {
    it('should call an Event handler when the target matches a CSS selector', async () => {
        document.body.innerHTML = '<main><a></a></main>';

        const result = new Promise<[Element, Event, Element, string]>(resolve =>
            document.body.addEventListener(
                'test',
                delegate('a', function (event, target, detail: string) {
                    resolve([this, event, target, detail]);
                })
            )
        );
        const customEvent = new CustomEvent('test', {
                bubbles: true,
                detail: 'test'
            }),
            link = document.querySelector('a');

        link.dispatchEvent(customEvent);

        const [thisNode, event, target, detail] = await result;

        expect(thisNode).toBe(document.body);
        expect(event).toBe(customEvent);
        expect(target).toBe(link);
        expect(detail).toBe('test');
    });

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
