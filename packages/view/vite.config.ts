import { defineConfig } from 'vite';
import solid from 'vite-plugin-solid';

export default defineConfig(async () => ({
  plugins: [solid()],
  clearScreen: false,
  server: {
    port: 30000,
    strictPort: true,
    watch: {
      ignored: ['**/src-tauri/**'],
    },
  },
}));
