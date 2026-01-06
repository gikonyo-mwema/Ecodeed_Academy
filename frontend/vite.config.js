import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: '/',
  optimizeDeps: {
    exclude: ['flowbite-react'],
    include: ['flowbite']
  },
  // Production build configuration
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false, // Disable source maps to avoid 404 warnings
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          redux: ['@reduxjs/toolkit', 'react-redux'],
          ui: ['flowbite-react']
        }
      }
    }
  },
  server: {
    port: 5173,
    host: true,
    hmr: {
      port: 5174,
      host: 'localhost'
    },
    // Only use proxy in development mode
    ...(mode === 'development' && {
      proxy: {
        '/api': {
          // Use Docker service name for container-to-container communication
          target: process.env.VITE_PROXY_TARGET || 'http://backend:8000',
          changeOrigin: true,
          secure: false
        }
      }
    })
  }
}));
