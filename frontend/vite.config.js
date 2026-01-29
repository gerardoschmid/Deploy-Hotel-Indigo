import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Configuración para Desarrollo (npm run dev)
  server: {
    host: true,
    port: 5173,
    strictPort: true,
  },
  // --- ESTO ES LO QUE SOLUCIONA EL ERROR EN RAILWAY ---
  // Configuración para Producción (npm run preview)
  preview: {
    host: true,
    port: 4173,
    strictPort: true,
    allowedHosts: [
      'hote-frontend-production.up.railway.app', // Host que te pedía el error
      '.up.railway.app' // Permite cualquier subdominio de Railway por seguridad
    ]
  }
})