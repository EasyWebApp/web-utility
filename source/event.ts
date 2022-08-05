import { uniqueID } from './data';

export type DelegateEventHandler<T = any> = (
    event: Event,
    currentTarget: Element,
    detail?: T
) => any;

export function delegate<T>(
    selector: string,
    handler: DelegateEventHandler<T>
) {
    return function (this: Node, event: Event) {
        var node: EventTarget,
            path = event.composedPath();

        while ((node = path.shift()) && node !== event.currentTarget)
            if (node instanceof HTMLElement && node.matches(selector))
                return handler.call(
                    this,
                    event,
                    node,
                    (event as CustomEvent).detail
                );
    };
}

export const documentReady =
    typeof window !== 'undefined'
        ? new Promise<void>(resolve => {
              function done() {
                  document?.removeEventListener('DOMContentLoaded', done);
                  window.removeEventListener('load', done);
                  resolve();
              }
              document?.addEventListener('DOMContentLoaded', done);
              window.addEventListener('load', done);

              setTimeout(function check() {
                  document?.readyState === 'complete'
                      ? resolve()
                      : setTimeout(check);
              });
          })
        : Promise.resolve();

export function promisify<T extends Event>(scope: string, element: Element) {
    return new Promise<T>((resolve, reject) => {
        function end(event: T) {
            resolve(event), clean();
        }
        function cancel(event: T) {
            reject(event), clean();
        }

        function clean() {
            element.removeEventListener(scope + 'end', end);
            element.removeEventListener(scope + 'cancel', cancel);
        }

        element.addEventListener(scope + 'end', end);
        element.addEventListener(scope + 'cancel', cancel);
    });
}

export type MessageGlobal = Window | Worker;

export function createMessageServer(
    handlers: Record<string, (data: any) => any | Promise<any>>
) {
    async function server({
        data: { type, id, ...data },
        source,
        origin
    }: MessageEvent) {
        var result = handlers[type]?.(data);

        if (result instanceof Promise) result = await result;
        // @ts-ignore
        (source as MessageGlobal).postMessage({ ...result, id }, origin);
    }

    globalThis.addEventListener('message', server);

    return () => globalThis.removeEventListener('message', server);
}

export function createMessageClient(target: Window | Worker, origin = '*') {
    return (type: string, data?: any) =>
        new Promise(resolve => {
            const UID = uniqueID();

            function handler({ data: { id, ...data } }: MessageEvent) {
                if (id !== UID) return;

                resolve(data);

                globalThis.removeEventListener('message', handler);
            }

            globalThis.addEventListener('message', handler);
            // @ts-ignore
            target.postMessage({ id: UID, type, ...data }, origin);
        });
}

export function serviceWorkerUpdate(registration: ServiceWorkerRegistration) {
    return new Promise<ServiceWorker>(resolve => {
        if (registration.waiting) return resolve(registration.waiting);

        registration.onupdatefound = () =>
            registration.installing?.addEventListener(
                'statechange',
                function () {
                    if (
                        this.state === 'installed' &&
                        navigator.serviceWorker.controller
                    )
                        resolve(this);
                }
            );
    });
}
