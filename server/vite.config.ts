import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';
import { fileURLToPath } from 'url';
import react from '@vitejs/plugin-react';
import { vitePluginManusRuntime } from 'vite-plugin-manus-runtime';

const projectRoot = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [vue(), react(), vitePluginManusRuntime()],
  resolve: {
    alias: {
      '@': path.resolve(projectRoot, './client/src'),
      '@shared': path.resolve(projectRoot, './shared'),
      '@server': path.resolve(projectRoot, './server'),
    },
  },
  root: path.resolve(projectRoot, 'client'),
  build: {
    outDir: path.resolve(projectRoot, 'dist/public'),
    emptyOutDir: true,
  },
  server: {
    fs: { allow: [path.resolve(projectRoot)] },
  },
});
