# Web utility

**Web front-end** toolkit based on [TypeScript][1]

[![NPM Dependency](https://david-dm.org/EasyWebApp/web-utility.svg)][2]
[![Build Status](https://travis-ci.com/EasyWebApp/web-utility.svg?branch=v2)][3]

[![NPM](https://nodei.co/npm/web-utility.png?downloads=true&downloadRank=true&stars=true)][4]

## Usage

[API document](https://web-cell.dev/web-utility/)

### Message Channel

`index.ts`

```TypeScript
import { createMessageServer } from 'web-utility';

createMessageServer({
    preset: () => ({test: 1})
});
```

`iframe.ts`

```TypeScript
import { createMessageClient } from 'web-utility';

const request = createMessageClient(self.parent);

(async () => {
    console.log(await request('preset'));  // { test: 1 }
})();
```

### Internationalization

`tsconfig.json`

```json
{
    "compilerOptions": {
        "module": "ESNext"
    }
}
```

`source/i18n/en-US.ts`

```typescript
export enum en_US {
    title = 'Test'
}

export type I18nMap = typeof en_US;
```

`source/i18n/zh-CN.ts`

```typescript
export enum zh_CN {
    title = '测试'
}
```

`source/index.tsx`

```javascript
import { documentReady, render, createCell } from 'web-cell';
import { createI18nScope } from 'web-utility';

import { I18nMap } from './i18n/en-US';

console.log(navigator.languages.includes('zh-CN')); // true

const { loaded, i18nTextOf } = createI18nScope<I18nMap>({
    'en-US': async () => (await import('./i18n/en-US')).en_US,
    'zh-CN': async () => (await import('./i18n/zh-CN')).zh_CN
}, 'en-US');

Promise.all([loaded, documentReady]).then(() =>
    render(<h1>{i18nTextOf('title')}</h1>); // <h1>测试</h1>
);
```

[1]: https://www.typescriptlang.org/
[2]: https://david-dm.org/EasyWebApp/web-utility
[3]: https://travis-ci.com/EasyWebApp/web-utility
[4]: https://nodei.co/npm/web-utility/
