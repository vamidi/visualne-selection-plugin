import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import sourcemaps from 'rollup-plugin-sourcemaps';
import { eslint } from 'rollup-plugin-eslint';

const extensions = ['.js', '.jsx', '.ts', '.tsx'];
const bundle = 'visualne-selection-plugin';
const globals = {
    'visualne': 'visualne',
};

module.exports = {
    // mode: 'development',
    input: 'src/index.ts',
    external: [
        'visualne',
        'visualne/types/view',
    ],
    output: [
        {
            name: 'VisualNE',
            file: `dist/${bundle}.common.js`,
            format: 'cjs',
            exports: 'named',
            globals,
        },
        {
            name: 'VisualNE',
            file: `dist/${bundle}.esm.js`,
            format: 'esm',
            exports: 'named',
            globals,
        }
    ],
    plugins: [
        sourcemaps(),
        eslint({
            exclude: [
                'src/**.scss',
                'src/**.css',
                'src/**.less',
                'src/**.sass',
            ]
        }),
        resolve({
            mainFields: ['module', 'main', 'jsnext:main', 'browser'],
            extensions
        }),
        babel({
            exclude: './node_modules/**',
            extensions,
        }),
    ]
};

