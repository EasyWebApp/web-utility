import { parseCookie, setCookie } from '../source/HTTP';

describe('HTTP', () => {
    it('should set a Cookie value in Web browser', () => {
        setCookie('test', 'value');

        expect(document.cookie.includes('test=value'));
    });

    it('should parse Cookie values in Web browser', () => {
        const { test } = parseCookie(document.cookie);

        expect(test).toBe('value');
    });

    it('should delete a Cookie value in Web browser', () => {
        setCookie('test', '', { expires: new Date(0) });

        expect(document.cookie.includes('test=')).toBe(false);
    });
});
