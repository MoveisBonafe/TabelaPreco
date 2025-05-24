import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Configuração específica para GitHub Pages
export default defineConfig({
  plugins: [react()],
  base: '/TabelaPreco/', // Nome do seu repositório
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
      '@assets': path.resolve(__dirname, './attached_assets'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: path.resolve(__dirname, 'index.html')
      }
    }
  },
  define: {
    // Garantir que as variáveis de ambiente funcionem no GitHub Pages
    'process.env': {}
  }
})