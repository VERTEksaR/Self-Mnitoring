import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: "127.0.0.1",
    port: 5173,
    // Проксируем запросы к бэку, чтобы браузер не блокировал по CORS
    proxy: {
      '/auth': 'http://localhost:8000',
      '/categories': 'http://localhost:8000',
      '/accounts': 'http://localhost:8000',
      '/transactions': 'http://localhost:8000',
      '/users': 'http://localhost:8000',
    },
  },
});
