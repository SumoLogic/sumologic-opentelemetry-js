import commonjs from "@rollup/plugin-commonjs";
import typescript from "rollup-plugin-typescript2";
import resolve from "@rollup/plugin-node-resolve";
import { terser } from "rollup-plugin-terser";

export default {
  input: "src/index.ts",
  output: {
    dir: "build",
    format: "iife",
  },
  plugins: [
    resolve({
      browser: true,
      preferBuiltins: true,
      customResolveOptions: {
        moduleDirectory: ["node_modules", "./opentelemetry-js/packages"],
      },
    }),
    typescript({
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
