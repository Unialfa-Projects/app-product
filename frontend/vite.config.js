import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  css: {
    postcss: {}
  },
  // No "npm run dev", repassa /api para o backend (mesmo papel do nginx no Docker).
  server: {
    proxy: {
      '/api': process.env.VITE_PROXY_API || 'http://localhost:3001'
    }
  }
})
