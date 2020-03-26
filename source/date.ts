const TimeUnit = new Map([
    ['s', 1000],
    ['m', 60],
    ['H', 60],
    ['D', 24],
    ['W', 7],
    ['M', 30 / 7],
    ['Y', 12]
]);

export type TimeData = number | string | Date;

export function diffTime(
    end: TimeData,
    start: TimeData = new Date(),
    map = TimeUnit
) {
    let distance = +new Date(end) - +start,
        unit = 'ms';

    for (const [code, scale] of map) {
        const rest = distance / scale;

        if (Math.abs(rest) > 1) (distance = rest), (unit = code);
        else break;
    }

    return { distance: +distance.toFixed(0), unit };
}

const unitISO = ['Y', 'M', 'D', 'H', 'm', 's', 'ms'],
    patternISO = /[YMDHms]+/g;

export function formatDate(
    time: number | string | Date = new Date(),
    template = 'YYYY-MM-DD HH:mm:ss'
) {
    time = time instanceof Date ? time : new Date(time);

    const temp: Record<string, string> = new Date(
        +time - time.getTimezoneOffset() * 60 * 1000
    )
        .toJSON()
        .split(/\D/)
        .reduce((temp, section, index) => {
            temp[unitISO[index]] = section;

            return temp;
        }, {});

    return template.replace(patternISO, section =>
        temp[section[0]].padStart(section.length, '0')
    );
}
