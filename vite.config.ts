import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // 关键修改：使用相对路径，确保在 NAS 子目录（如 /my-app/）下能正确加载资源
  base: './',
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
  server: {
    host: true, // Allow network access for local testing
  }
});