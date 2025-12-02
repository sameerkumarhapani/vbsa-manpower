import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/vbsa-manpower/',
  server: {
    port: 9155,
    host: true,
  },
})
