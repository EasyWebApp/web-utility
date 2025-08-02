export const parseCookie = <T extends Record<string, string>>(
    value = globalThis.document?.cookie
) =>
    (value
        ? Object.fromEntries(value.split(/;\s*/).map(item => item.split('=')))
        : {}) as T;

export interface CookieAttribute {
    domain?: string;
    path?: string;
    expires?: Date;
    'max-age'?: number;
    samesite?: 'lax' | 'strict' | 'none';
    secure?: boolean;
    partitioned?: boolean;
}

export function setCookie(
    key: string,
    value: string,
    attributes: CookieAttribute = {}
) {
    const data = `${key}=${value}`,
        option = Object.entries(attributes)
            .map(([key, value]) =>
                typeof value === 'boolean'
                    ? value
                        ? key
                        : ''
                    : `${key}=${value}`
            )
            .filter(Boolean)
            .join('; ');

    document.cookie = `${data}; expires=${new Date(0)}`;

    return (document.cookie = `${data}; ${option}`);
}
