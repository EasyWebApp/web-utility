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
