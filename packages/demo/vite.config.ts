import { viteSingleFile } from 'vite-plugin-singlefile'
import { defineConfig } from 'vite'

export default defineConfig(async () => ({
  clearScreen: false,
  server: {
    port: 30000,
    strictPort: true,
    watch: {
      ignored: ['**/src-tauri/**']
    }
  },
  plugins: [viteSingleFile()]
}))
