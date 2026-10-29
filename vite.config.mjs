import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// A interface (React + TypeScript) é compilada para out/renderer e carregada pelo Electron via file://
export default defineConfig({
  root: path.resolve(import.meta.dirname, 'src/renderer'),
  base: './',
  plugins: [react()],
  build: {
    outDir: path.resolve(import.meta.dirname, 'out/renderer'),
    emptyOutDir: true,
    target: 'chrome130',
    chunkSizeWarningLimit: 4000,
    sourcemap: false,
  },
  server: { fs: { allow: [import.meta.dirname] } },
});
