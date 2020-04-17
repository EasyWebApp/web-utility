export const Second = 1000;
export const Minute = Second * 60;
export const Quarter = Minute * 15;
export const Hour = Quarter * 4;
export const Day = Hour * 24;
export const Week = Day * 7;
export const Year = Day * 365;
export const Month = Year / 12;
export const Season = Month * 3;

const TimeUnit = new Map([
    ['s', Second],
    ['m', Minute],
    ['H', Hour],
    ['D', Day],
    ['W', Week],
    ['M', Month],
    ['Y', Year]
]);

export type TimeData = number | string | Date;

export function diffTime(
    end: TimeData,
    start: TimeData = new Date(),
    map = TimeUnit
) {
    const distance = +new Date(end) - +start;

    for (const [unit, base] of [...map].reverse()) {
        const rest = distance / base;

        if (Math.abs(rest) >= 1) return { distance: +rest.toFixed(0), unit };
    }

    return { distance, unit: 'ms' };
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

export function changeMonth(date: TimeData, delta: number) {
    date = new Date(date);

    const month = date.getMonth() + delta;

    date.setFullYear(date.getFullYear() + Math.floor(month / 12));

    delta = month % 12;

    date.setMonth(delta < 0 ? 12 + delta : delta);

    return date;
}
