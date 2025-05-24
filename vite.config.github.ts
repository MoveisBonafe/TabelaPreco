import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// Configuração específica para GitHub Pages
export default defineConfig({
  plugins: [react()],
  base: '/TabelaPreco/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
      '@shared': path.resolve(__dirname, './shared'),
      '@assets': path.resolve(__dirname, './attached_assets'),
    },
  },
  root: path.resolve(__dirname, 'client'),
  build: {
    outDir: path.resolve(__dirname, 'client/dist'),
    emptyOutDir: true,
    rollupOptions: {
      output: {
        entryFileNames: `assets/app-[hash].js`,
        chunkFileNames: `assets/chunk-[hash].js`,
        assetFileNames: `assets/asset-[hash].[ext]`
      }
    }
  },
  define: {
    'process.env': {},
    'import.meta.env.VITE_FORCE_NEW_BUILD': JSON.stringify(Date.now())
  }
})