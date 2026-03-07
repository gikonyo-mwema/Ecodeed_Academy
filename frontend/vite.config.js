import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: '/',
  // Optimize dependency pre-bundling for faster startup
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@reduxjs/toolkit',
      'react-redux',
      'flowbite',
      'flowbite-react',
      'framer-motion',
      'react-icons',
      'react-toastify'
    ],
    // Force pre-bundling to avoid on-demand compilation
    force: false,
    // Increase esbuild threads for faster bundling
    esbuildOptions: {
      target: 'esnext'
    }
  },
  // Enable caching for faster subsequent loads
  cacheDir: 'node_modules/.vite',
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
    host: '0.0.0.0',
    // Optimized HMR for Docker
    hmr: {
      port: 5173,
      clientPort: 5173,
      host: 'localhost',
      protocol: 'ws'
    },
    // Watch configuration for Docker volumes
    watch: {
      usePolling: true,
      interval: 1000
    },
    // Warm up frequently used files
    warmup: {
      clientFiles: [
        './src/App.jsx',
        './src/main.jsx',
        './src/index.css'
      ]
    },
    // Only use proxy in development mode
    ...(mode === 'development' && {
      proxy: {
        '/api': {
          target: process.env.VITE_PROXY_TARGET || process.env.VITE_API_URL || 'http://localhost:8000',
          changeOrigin: true,
          secure: false
        },
        '/media': {
          target: process.env.VITE_PROXY_TARGET || process.env.VITE_API_URL || 'http://localhost:8000',
          changeOrigin: true,
          secure: false
        }
      }
    })
  }
}));
