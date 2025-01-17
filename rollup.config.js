import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import livereload from 'rollup-plugin-livereload';
import terser from '@rollup/plugin-terser';
import postcss from 'rollup-plugin-postcss';
import css from 'rollup-plugin-css-only';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import copy from 'rollup-plugin-copy';


const production = !process.env.ROLLUP_WATCH;

export default {
  input: 'src/main.js',
  output: {
    sourcemap: true,
    format: 'iife',
    name: 'app',
    file: 'public/build/bundle.js',
  },
  plugins: [
    svelte({
      compilerOptions: {
        dev: !production,
      },
    }),
    css({ output: 'bundle.css' }),
    postcss({
      extract: true,
      plugins: [tailwindcss(), autoprefixer()],
    }),
    resolve({
      browser: true,
      dedupe: ['svelte'],
    }),
    commonjs(),
    !production && livereload('public'),
    production && terser(),
    copy({
      targets: [
        {
          src: 'node_modules/katex/dist/fonts/*',
          dest: 'public/build/fonts'
        }
      ]
    }),
  ],
  watch: {
    clearScreen: false,
  },
};
