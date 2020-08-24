import { uniqueID } from './data';

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

        (source as MessageGlobal).postMessage({ ...result, id }, origin);
    }

    self.addEventListener('message', server);

    return () => self.removeEventListener('message', server);
}

export function createMessageClient(target: Window | Worker, origin = '*') {
    return (type: string, data?: any) =>
        new Promise(resolve => {
            const UID = uniqueID();

            function handler({ data: { id, ...data } }: MessageEvent) {
                if (id !== UID) return;

                resolve(data);

                self.removeEventListener('message', handler);
            }

            self.addEventListener('message', handler);

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
