import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // Emit hashed JS/CSS next to index.html (not under /assets/). Some Vercel
  // legacy static-build outputs omit nested public/assets/* so requests fall
  // through to the SPA index.html and the UI loads without styles or scripts.
  build: {
    assetsDir: '',
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
})
