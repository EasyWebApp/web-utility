import { promisify } from './event';

export interface CartesianCoordinate {
    x: number;
    y: number;
    z?: number;
}

export class PageVector {
    from: CartesianCoordinate;
    to: CartesianCoordinate;

    constructor(from: CartesianCoordinate, to: CartesianCoordinate) {
        this.from = from;
        this.to = to;
    }

    get length() {
        const { from, to } = this;

        return Math.sqrt(
            Math.pow(to.x - from.x, 2) +
                Math.pow(to.y - from.y, 2) +
                (to.z != null ? Math.pow(to.z - from.z, 2) : 0)
        );
    }

    get direction() {
        const { from, to } = this;
        const XD = to.x - from.x,
            YD = to.y - from.y,
            ZD = to.z - from.z;
        const XL = Math.abs(XD),
            YL = Math.abs(YD),
            ZL = Math.abs(ZD);

        switch (isNaN(ZL) ? Math.max(XL, YL) : Math.max(XL, YL, ZL)) {
            case XL:
                return XD > 0 ? 'right' : 'left';
            case YL:
                return YD > 0 ? 'forward' : 'backward';
            case ZL:
                return ZD > 0 ? 'up' : 'down';
        }
    }
}

const { getComputedStyle, getSelection, requestAnimationFrame } = globalThis;

export function getSwipeVector(
    from: CartesianCoordinate,
    to: CartesianCoordinate,
    threshold = parseInt(getComputedStyle(document.body).fontSize) * 6
) {
    const vector = new PageVector(from, to);

    if (vector.length >= threshold && !getSelection()?.toString().trim())
        return vector;
}

export function durationOf(
    type: 'transition' | 'animation',
    element: HTMLElement
) {
    const { transitionDuration, animationDuration } = getComputedStyle(element);

    const duration =
        type === 'animation' ? animationDuration : transitionDuration;

    return parseFloat(duration) * (duration.slice(-2) === 'ms' ? 1 : 1000);
}

export function watchMotion<T extends Event>(
    type: 'transition' | 'animation',
    element: HTMLElement
) {
    return Promise.race([
        promisify<T>(type, element).catch(event => Promise.resolve(event)),
        new Promise(resolve => setTimeout(resolve, durationOf(type, element)))
    ]);
}

function fadeIn<T extends Event>(
    type: 'transition' | 'animation',
    element: HTMLElement,
    className: string,
    display: string
) {
    element.style.display = display;

    const end = watchMotion<T>(type, element);

    return new Promise<T>(resolve =>
        requestAnimationFrame(() => {
            element.classList.add(className);

            end.then(resolve);
        })
    );
}

async function fadeOut<T extends Event>(
    type: 'transition' | 'animation',
    element: HTMLElement,
    className: string,
    remove?: boolean
) {
    const end = watchMotion<T>(type, element);

    element.classList.remove(className);

    await end;

    if (remove) element.remove();
    else element.style.display = 'none';
}

export function transitIn(
    element: HTMLElement,
    className: string,
    display = 'block'
) {
    return fadeIn<TransitionEvent>('transition', element, className, display);
}

export function animateIn(
    element: HTMLElement,
    className: string,
    display = 'block'
) {
    return fadeIn<AnimationEvent>('animation', element, className, display);
}

export function transitOut(
    element: HTMLElement,
    className: string,
    remove?: boolean
) {
    return fadeOut<TransitionEvent>('transition', element, className, remove);
}

export function animateOut(
    element: HTMLElement,
    className: string,
    remove?: boolean
) {
    return fadeOut<AnimationEvent>('animation', element, className, remove);
}
