import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Relative paths → dist/index.html works by double-click (file://) AND any static host.
  // HashRouter (in App) makes all pages work without server rewrites.
  base: './',
  server: { port: 5175, host: '0.0.0.0', strictPort: true, open: false },
  preview: { port: 5175, host: '0.0.0.0' }
});
