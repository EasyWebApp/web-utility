export async function describe(title: string, cases: () => any) {
    console.log(title);
    console.time(title);

    await cases();

    console.timeEnd(title);
}

export async function it<T>(
    title: string,
    userCase: (expect: (status: boolean) => void) => T | Promise<T>
): Promise<T> {
    title = '    ' + title;

    console.time(title);
    try {
        return await userCase(status => console.assert(status, title));
    } finally {
        console.timeEnd(title);
    }
}
