import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import dts from 'rollup-plugin-dts';

const external = ['openapi-fetch'];

export default [
  {
    input: 'src/index.ts',
    output: [
      {
        file: 'dist/index.js',
        format: 'cjs',
        exports: 'named'
      },
      {
        file: 'dist/index.esm.js',
        format: 'es'
      }
    ],
    external,
    plugins: [
      resolve(),
      commonjs(),
      typescript({
        tsconfig: './tsconfig.json',
        declaration: false
      })
    ]
  },
  {
    input: 'src/index.ts',
    output: {
      file: 'dist/index.d.ts',
      format: 'es'
    },
    external,
    plugins: [dts()]
  }
];