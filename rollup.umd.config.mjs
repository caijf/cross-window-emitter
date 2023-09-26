import { defineConfig } from 'rollup';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import pkg from './package.json' assert { type: 'json' };

const globalName = 'crossWindowEmitter';

export default defineConfig({
  input: 'src/index.ts',
  output: [
    {
      format: 'umd',
      file: `dist/${pkg.name}.js`,
      name: globalName,
      sourcemap: true
    },
    {
      format: 'umd',
      file: `dist/${pkg.name}.min.js`,
      name: globalName,
      sourcemap: true,
      plugins: [terser()]
    }
  ],
  plugins: [resolve(), commonjs(), typescript()]
});
