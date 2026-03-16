import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: {
    compilerOptions: {
      composite: false,
      paths: {},
    },
  },
  splitting: false,
  sourcemap: true,
  clean: true,
  outDir: 'dist',
  external: ['@alexma03/utcp-sdk', '@alexma03/utcp-http', 'js-yaml'],
});
