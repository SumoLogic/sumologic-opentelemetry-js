import pkg from './package.json';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript2';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import dts from 'rollup-plugin-dts';

// we use DTS to generate single index.d.ts file with all typescript definitions from @opentelemetry packages
const dtsInstance = dts({
  compilerOptions: {
    baseUrl: './',
    paths: {
      '@opentelemetry/api': ['./dist/opentelemetry-js-api/src/index.d.ts'],
      '@opentelemetry/*': [
        './dist/opentelemetry-js/packages/opentelemetry-*/src/index.d.ts',
        './dist/opentelemetry-js-contrib/plugins/web/opentelemetry-*/src/index.d.ts',
      ],
    },
  },
});

// this is a hack to omit DTS namespace fixer which causes an error when parsing @opentelemetry/api code
dtsInstance.renderChunk = (code, chunk) => {
  return { code, map: { mappings: '' } };
};

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: pkg.main,
        format: 'umd',
        name: 'sumoLogicOpenTelemetryTracing',
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
  },
  {
    input: './dist/index.d.ts',
    output: [{ file: 'dist/index.d.ts', format: 'es' }],
    plugins: [dtsInstance],
  },
];
