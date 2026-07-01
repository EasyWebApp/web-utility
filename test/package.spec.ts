const packageJSON = require('../package.json');

describe('Package exports', () => {
    it('should expose standard npm ESM and CommonJS entry points', () => {
        expect(packageJSON.main).toBe('dist/index.js');
        expect(packageJSON.module).toBe('dist/index.mjs');
        expect(packageJSON.exports).toEqual({
            '.': {
                types: './dist/index.d.ts',
                import: './dist/index.mjs',
                require: './dist/index.js',
                default: './dist/index.js'
            },
            './package.json': './package.json'
        });
    });
});
