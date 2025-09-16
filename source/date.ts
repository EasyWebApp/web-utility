import { Scalar } from './math';

export const Second = 1000;
export const Minute = Second * 60;
export const Quarter = Minute * 15;
export const Hour = Quarter * 4;
export const Day = Hour * 24;
export const Week = Day * 7;
export const Year = Day * 365;
export const Month = Year / 12;
export const Season = Month * 3;

export class Timestamp extends Scalar {
    units = [
        { base: Second, name: 's' },
        { base: Minute, name: 'm' },
        { base: Hour, name: 'H' },
        { base: Day, name: 'D' },
        { base: Week, name: 'W' },
        { base: Month, name: 'M' },
        { base: Year, name: 'Y' }
    ];

    toShortString(fractionDigits = 0) {
        return super.toShortString(fractionDigits);
    }
}

export type TimeData = number | string | Date;

/**
 * @deprecated since v4.4, use {@link Timestamp.distanceOf} instead.
 */
export function diffTime(end: TimeData, start: TimeData = new Date()) {
    const timeDistance = Timestamp.distanceOf(
        +new Date(end),
        +new Date(start)
    ) as Timestamp;

    const [value, unit] = timeDistance.toShortString().split(/\s+/);

    return { distance: +value, unit };
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
    const [year, month, day, hour, minute, second, millisecond] = new Date(time)
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

export function changeYear(date: TimeData, delta: number) {
    date = new Date(date);

    date.setFullYear(date.getFullYear() + delta);

    return date;
}

export function changeMonth(date: TimeData, delta: number) {
    date = new Date(date);

    const month = date.getMonth() + delta;

    date = changeYear(date, Math.floor(month / 12));

    delta = month % 12;

    date.setMonth(delta < 0 ? 12 + delta : delta);

    return date;
}

export const changeDate = (date: TimeData, unit: number, delta: number) =>
    unit === Year
        ? changeYear(date, delta)
        : unit === Month
          ? changeMonth(date, delta)
          : new Date(+new Date(date) + delta * unit);

const DateLength2Unit = {
    4: Year,
    7: Month,
    10: Day,
    13: Hour,
    16: Minute,
    19: Second
};

export function makeDateRange(value: string) {
    const defaultValue = `2025-01-01T00:00:00.000Z`;

    const startedAt = new Date(value + defaultValue.slice(value.length));
    const endedAt = changeDate(startedAt, DateLength2Unit[value.length], 1);

    return [startedAt, endedAt];
}
