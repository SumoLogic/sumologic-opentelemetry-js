import pkg from './package.json';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import resolve from '@rollup/plugin-node-resolve';
import sourcemaps from 'rollup-plugin-sourcemaps';
import json from '@rollup/plugin-json';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: './dist/browser.js',
      format: 'iife',
      sourcemap: true,
    },
    {
      file: pkg.main,
      format: 'cjs',
      sourcemap: true,
    },
  ],
  plugins: [
    resolve({
      browser: true,
      preferBuiltins: true,
      customResolveOptions: {
        moduleDirectories: ['node_modules', './opentelemetry-js/packages'],
      },
    }),
    json(),
    typescript({
      typescript: require('typescript'),
      useTsconfigDeclarationDir: true,
      clean: true,
      check: true,
    }),
    commonjs({
      include: /node_modules/,
    }),
    terser({
      output: {
        comments: false,
      },
    }),
    sourcemaps(),
  ],
};
