import fs from 'fs';
import path from 'path';
import babel from '@rollup/plugin-babel';
import { terser } from 'rollup-plugin-terser';

// nuke dist directory
fs.rmdirSync(path.resolve(__dirname, './dist'), { recursive: true });

export default [{
    input: './src/index.js',
    plugins: [
        babel({
            babelHelpers: 'bundled', // default
        }),
        terser(),
    ],
    output: {
        file: './dist/peeping-tom.umd.js',
        format: 'umd',
        name: 'peepingTom',
    },
}, {
    input: './src/index.js',
    output: {
        file: './dist/peeping-tom.esm.js',
        format: 'esm',
    },
}];
