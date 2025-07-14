import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  optimizeDeps: {
    include: [
      "react-icons/fa",
      "react-icons/md",
      "react-icons/hi",
      "react-icons/ri",
      "react-icons/bs",
      "react-icons/ai",
    ],
  },
})
