import pkg from '../package.json' assert { type: 'json' }
import typescript from '@rollup/plugin-typescript'

export default {
  input: './src/index.ts',
  output: [
    // 1. cjs -> commonjs
    // 2. esm
    {
      format: 'cjs',
      file: pkg.main,
      sourcemap: 'inline'
    },
    {
      format: 'es',
      file: pkg.module,
      sourcemap: 'inline'
    }
  ],
  plugins: [typescript()]
}
