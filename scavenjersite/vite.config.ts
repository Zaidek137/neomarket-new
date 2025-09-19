import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  define: {
    'process.env': {},
    global: 'globalThis',
  },
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['framer-motion', 'clsx', 'tailwind-merge', 'lucide-react'],
          'web3-vendor': ['thirdweb', '@wagmi/core', 'wagmi'],
          'data-vendor': ['@supabase/supabase-js']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: true
  },
  envPrefix: 'VITE_'
});