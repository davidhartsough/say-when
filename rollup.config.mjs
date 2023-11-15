import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";

const terserOptions = {
  mangle: false,
  keep_classnames: true,
  keep_fnames: true,
  format: { comments: false },
};

/**
 * @type {import('rollup').RollupOptions}
 */
export default [
  {
    input: "src/loc.ts",
    output: {
      file: "public/loc.js",
      format: "es",
    },
    plugins: [resolve(), typescript(), commonjs(), terser(terserOptions)],
  },
  {
    input: "src/c/app.ts",
    output: {
      file: "public/c/app.js",
      format: "es",
    },
    plugins: [resolve(), typescript(), commonjs(), terser(terserOptions)],
  },
  {
    input: "src/t/app.ts",
    output: {
      file: "public/t/app.js",
      format: "es",
    },
    plugins: [resolve(), typescript(), commonjs(), terser(terserOptions)],
  },
  {
    input: "src/d/app.ts",
    output: {
      file: "public/d/app.js",
      format: "es",
    },
    plugins: [resolve(), typescript(), commonjs(), terser(terserOptions)],
  },
  {
    input: "src/e/app.ts",
    output: {
      file: "public/e/app.js",
      format: "es",
    },
    plugins: [resolve(), typescript(), commonjs(), terser(terserOptions)],
  },
  {
    input: "src/poll/app.ts",
    output: {
      file: "public/poll/app.js",
      format: "es",
    },
    plugins: [resolve(), typescript(), commonjs(), terser(terserOptions)],
  },
  {
    input: "src/vote/app.ts",
    output: {
      file: "public/vote/app.js",
      format: "es",
    },
    plugins: [resolve(), typescript(), commonjs(), terser(terserOptions)],
  },
];
