import { defineConfig } from 'rollup';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';

import pkg from './package.json' assert { type: "json" };

const globalName = 'crossWindowEmitter'

export default defineConfig({
  input: 'src/index.ts',
  external: ['cache2'],
  output: [
    {
      format: 'es',
      file: `dist/${pkg.name}.esm.js`
    },
    {
      format: 'cjs',
      file: `dist/${pkg.name}.cjs.js`
    }
  ],
  plugins: [resolve(), commonjs(), typescript()]
})
