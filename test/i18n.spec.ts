import { bootI18n, textJoin } from '../source/i18n';

describe('Internationalization', () => {
    enum en_US {
        title = 'Title',
        name = 'Name'
    }
    enum zh_CN {
        title = '标题',
        name = '名称'
    }
    enum zh_TW {
        title = '標題',
        name = '名稱'
    }

    it('should match the User-agent Language', () => {
        expect(navigator.language).toBe('en-US');

        const { language, words } = bootI18n({
            'en-US': en_US,
            'zh-CN': zh_CN
        });
        expect(language).toBe('en-US');
        expect(words.title).toBe(en_US.title);
    });

    it('should use the Default Language while mismatch the User-agent Language', () => {
        const { language, words } = bootI18n(
            { 'zh-TW': zh_TW, 'zh-CN': zh_CN },
            'zh-CN'
        );
        expect(language).toBe('zh-CN');
        expect(words.title).toBe(zh_CN.title);
        expect(document.documentElement.lang).toBe('zh-CN');

        const locale = bootI18n({ 'zh-TW': zh_TW, 'zh-CN': zh_CN });

        expect(locale.language).toBe('zh-CN');
        expect(locale.words.title).toBe(zh_CN.title);
        expect(document.documentElement.lang).toBe('zh-CN');
    });

    it('should join strings into text based on the rule of Matched language', () => {
        const { words } = bootI18n({ 'zh-TW': zh_TW, 'zh-CN': zh_CN });

        expect(
            textJoin(words.title, words.name, 'test', 'example', '8964')
        ).toBe(`${words.title}${words.name} test example 8964`);

        expect(
            textJoin(words.title, 'test', words.name, '8964', 'example')
        ).toBe(`${words.title} test ${words.name} 8964 example`);
    });
});
