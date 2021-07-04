import ts from '@rollup/plugin-typescript'
import { dependencies } from './package.json'

export default {
  input: 'src/index.ts',
  output: [
    {
      dir: 'dist',
      format: 'esm'
    }
  ],
  plugins: [ts()],
  external: [...Object.keys(dependencies)]
}
