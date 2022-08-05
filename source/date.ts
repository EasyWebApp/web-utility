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
    const distance = +new Date(end) - +new Date(start);

    for (const [unit, base] of [...map].reverse()) {
        const rest = distance / base;

        if (Math.abs(rest) >= 1) return { distance: +rest.toFixed(0), unit };
    }

    return { distance, unit: 'ms' };
}

function fitUnit(value: string) {
    value = +value + '';

    return (template: string) =>
        (value.length < template.length
            ? value.padStart(template.length, '0')
            : value
        ).slice(-Math.max(template.length, 2));
}

export function formatDate(
    time: TimeData = new Date(),
    template = 'YYYY-MM-DD HH:mm:ss'
) {
    time = time instanceof Date ? time : new Date(time);
    time = new Date(+time - time.getTimezoneOffset() * Minute);

    const [year, month, day, hour, minute, second, millisecond] = time
        .toJSON()
        .split(/\D/);

    return template
        .replace(/ms/g, millisecond)
        .replace(/Y+/g, fitUnit(year))
        .replace(/M+/g, fitUnit(month))
        .replace(/D+/g, fitUnit(day))
        .replace(/H+/g, fitUnit(hour))
        .replace(/m+/g, fitUnit(minute))
        .replace(/s+/g, fitUnit(second));
}

export function changeMonth(date: TimeData, delta: number) {
    date = new Date(date);

    const month = date.getMonth() + delta;

    date.setFullYear(date.getFullYear() + Math.floor(month / 12));

    delta = month % 12;

    date.setMonth(delta < 0 ? 12 + delta : delta);

    return date;
}
