import packageJSON from '../package.json';

describe('Package exports', () => {
    it('should expose standard npm ESM & CJS entry points', () => {
        expect(packageJSON.types).toBe('dist/index.d.ts');
        expect(packageJSON.source).toBe('source/index.ts');
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
