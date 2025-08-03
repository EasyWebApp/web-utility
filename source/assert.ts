import { sleep } from './timer';

export async function describe(title: string, cases: () => any) {
    console.log(title);
    console.time(title);

    await cases();

    console.timeEnd(title);
}

export async function it<T>(
    title: string,
    userCase: (expect: (status: boolean) => void) => T | Promise<T>,
    secondsOut = 3
): Promise<T> {
    title = '    ' + title;

    console.time(title);

    function expect(status: boolean | (() => boolean)): void {
        const assert = typeof status === 'function' ? status : undefined;

        status = assert?.() ?? status;

        if (!status)
            throw new Error(`Assertion failed: ${title}\n\n${assert || ''}`);
    }

    async function timeOut(): Promise<T> {
        await sleep(secondsOut);

        throw new RangeError('Timed out');
    }
    try {
        return await Promise.race<T>([userCase(expect), timeOut()]);
    } finally {
        console.timeEnd(title);
    }
}
