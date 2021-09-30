import pkg from './package.json';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/index.ts',
  output: [
    {
      file: pkg.browser,
      format: 'iife',
    },
    {
      file: pkg.main,
      format: 'cjs',
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
    typescript({
      typescript: require('typescript'),
      useTsconfigDeclarationDir: true,
      clean: true,
      check: false,
    }),
    commonjs({
      include: /node_modules/,
    }),
    terser({
      output: {
        comments: false,
      },
    }),
  ],
};
