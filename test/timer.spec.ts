import { asyncLoop, sleep } from '../source/timer';

describe('Timer', () => {
    it('should wait for seconds', async () => {
        const start = Date.now();

        await sleep();

        expect(Date.now() - start).toBeGreaterThanOrEqual(1000);
    });

    it('should call a function for each unit seconds', async () => {
        const start = Date.now(),
            list = [];

        await new Promise<void>(resolve => {
            var stop = asyncLoop(() => {
                list.push(list.length);

                if (list.length < 3) return;

                stop();
                resolve();
            }, 0.25);
        });

        expect(Date.now() - start).toBeGreaterThanOrEqual(500);
        expect(list).toEqual([0, 1, 2]);
    });
});
