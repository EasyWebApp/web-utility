export function sleep(seconds = 1) {
    return new Promise<void>(resolve => setTimeout(resolve, seconds * 1000));
}

export function asyncLoop(executor: (...data: any[]) => any, seconds = 1) {
    var stop = false;

    (async () => {
        while (!stop) {
            const result = executor();

            if (result instanceof Promise) await result;

            await sleep(seconds);
        }
    })();

    return () => (stop = true);
}
