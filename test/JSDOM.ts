import { JSDOM } from 'jsdom';

const { window } = new JSDOM('', { url: 'https://web-cell.dev/web-utility/' });

Object.defineProperties(globalThis, {
    Event: { configurable: true, value: window.Event },
    CustomEvent: { configurable: true, value: window.CustomEvent }
});

for (const key of Object.getOwnPropertyNames(window))
    if (!(key in globalThis))
        Object.defineProperty(globalThis, key, {
            configurable: true,
            value: window[key as keyof typeof window]
        });

require('intersection-observer');

Object.defineProperty(globalThis, 'IntersectionObserver', {
    configurable: true,
    value: window.IntersectionObserver
});
