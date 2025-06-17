import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
    server: {
    allowedHosts: [
      'kali-ad-web.beesoftware.net',
      // 👈 añade aquí tu host público
      'kali-ftp-server.beesoftware.net',
      'web.beesoftware.net'
    ]
  }
})
