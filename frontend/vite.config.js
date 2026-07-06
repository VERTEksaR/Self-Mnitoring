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
      '/exercises': 'http://localhost:8000',
      '/trainings': 'http://localhost:8000',
      '/training-exercises': 'http://localhost:8000',
      '/steam/login': 'http://localhost:8000',
      '/steam/auth': 'http://localhost:8000',
      '/steam/accounts': 'http://localhost:8000',
      '/steam/link': 'http://localhost:8000',
      '/steam/player-info': 'http://localhost:8000',
      '/steam/tracked-games': 'http://localhost:8000',
      '/steam/ach-summary': 'http://localhost:8000',
      '/steam/ach-detail': 'http://localhost:8000',
      '/steam/news': 'http://localhost:8000',
    },
  },
});
