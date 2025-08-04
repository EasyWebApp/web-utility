import { sleep } from './timer';

export async function describe(title: string, cases: () => any) {
    console.log(title);
    console.time(title);

    await cases();

    console.timeEnd(title);
}

export type Expector = (status: boolean | (() => boolean)) => void;

export async function it<T>(
    title: string,
    userCase: (expect: Expector) => T | Promise<T>,
    secondsOut = 3
): Promise<T> {
    title = '    ' + title;

    console.time(title);

    const expect: Expector = status => {
        const assert = typeof status === 'function' ? status : undefined;

        status = assert?.() ?? status;

        if (!status)
            throw new Error(`Assertion failed: ${title}\n\n${assert || ''}`);
    };
    const timeOut = (): Promise<T> =>
        sleep(secondsOut).then(() =>
            Promise.reject(new RangeError('Timed out'))
        );
    try {
        return await Promise.race<T>([userCase(expect), timeOut()]);
    } finally {
        console.timeEnd(title);
    }
}
