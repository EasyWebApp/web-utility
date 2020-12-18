export type Constructor<T> = new (...args: any[]) => T;

export function isEmpty(value: any) {
    return !(value != null) || (!value && isNaN(value)) || value + '' === '';
}

export function byteLength(raw: string) {
    return raw.replace(/[^\u0021-\u007e\uff61-\uffef]/g, 'xx').length;
}

export function uniqueID() {
    return (Date.now() + parseInt((Math.random() + '').slice(2))).toString(36);
}

export function differ<T>(
    target: Record<string, T>,
    source: Record<string, T>
) {
    const data: Record<string, T> = {};

    for (const key in source)
        if (!(target[key] != null)) data[key] = source[key];

    return data;
}

export type GroupKey = string | number;
export type Iteratee<T> = GroupKey | ((item: T) => GroupKey | GroupKey[]);

export function groupBy<T extends Record<string, any>>(
    list: T[],
    iteratee: Iteratee<T>
) {
    const data: Record<string | number, T[]> = {};

    for (const item of list) {
        let keys: GroupKey | GroupKey[] =
            iteratee instanceof Function ? iteratee(item) : item[iteratee];

        if (!(keys instanceof Array)) keys = [keys];

        for (const key of new Set<GroupKey>(keys.filter(key => key != null)))
            (data[key] = data[key] || []).push(item);
    }

    return data;
}

export function parseJSON(value: string) {
    try {
        return JSON.parse(value);
    } catch {
        return value;
    }
}

function readQuoteValue(raw: string) {
    const quote = raw[0];
    const index = raw.indexOf(quote, 1);

    if (index < 0) throw SyntaxError(`A ${quote} is missing`);

    return raw.slice(1, index);
}

export function parseTextTable<T = {}>(
    raw: string,
    header?: boolean,
    separator = ','
) {
    const data = raw
        .trim()
        .split(/[\r\n]+/)
        .map(row => {
            const list = [];

            do {
                let value: string;

                if (row[0] === '"' || row[0] === "'") {
                    value = readQuoteValue(row);

                    row = row.slice(value.length + 3);
                } else {
                    const index = row.indexOf(separator);

                    if (index > -1) {
                        value = row.slice(0, index);

                        row = row.slice(index + 1);
                    } else {
                        value = row;

                        row = '';
                    }
                }

                try {
                    value = value.trim();

                    list.push(JSON.parse(value));
                } catch (error) {
                    list.push(value);
                }
            } while (row);

            return list;
        });

    return !header
        ? data
        : data.slice(1).map(row =>
              row.reduce((object, item, index) => {
                  object[data[0][index]] = item;

                  return object;
              }, {} as T)
          );
}
