export function uniqueID() {
    return (Date.now() + parseInt((Math.random() + '').slice(2))).toString(36);
}

export function differ(target: object, source: object) {
    const data = {};

    for (const key in source)
        if (!(target[key] != null)) data[key] = source[key];

    return data;
}

export type GroupKey = string | number;
export type Iteratee<T> = GroupKey | ((item: T) => GroupKey | GroupKey[]);
export interface Group<T> {
    [key: string]: T[];
    [key: number]: T[];
}

export function groupBy<T>(list: T[], iteratee: Iteratee<T>) {
    const data: Group<T> = {};

    for (const item of list) {
        let keys =
            iteratee instanceof Function ? iteratee(item) : item[iteratee];

        if (!(keys instanceof Array)) keys = [keys];

        for (const key of new Set<GroupKey>(keys))
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
