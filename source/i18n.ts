export function bootI18n<T extends Record<string, string>>(
    data: Record<string, T>,
    fallback = document.documentElement.lang || 'en-US'
) {
    const languages = [...navigator.languages, fallback];
    const language = languages.find(language => language in data);
    const words: T = Object.assign(
        {},
        ...languages.reverse().map(name => data[name])
    );
    document.documentElement.lang = language;

    return { language, words };
}

export function isNumberLetter(raw: string) {
    return /\p{N}/u.test(raw) || /\p{Ll}/u.test(raw.toLowerCase());
}

export function textJoin(...parts: string[]) {
    return parts
        .map((raw, index) => {
            const isNL = isNumberLetter(raw.slice(-1));

            if (index + 1 === parts.length) return raw;

            const diff = isNL !== isNumberLetter(parts[index + 1]?.trim()[0]);

            return raw + (diff || isNL ? ' ' : '');
        })
        .join('');
}
