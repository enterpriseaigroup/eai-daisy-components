import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/types': resolve(__dirname, './src/types'),
      '@/utils': resolve(__dirname, './src/utils'),
      '@/pipeline': resolve(__dirname, './src/pipeline'),
    },
  },

  build: {
    // Target ≤120% bundle size vs V1 baseline
    target: 'es2022',
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser',

    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.ts'),
        cli: resolve(__dirname, 'src/cli.ts'),
      },
      output: {
        // Optimize chunk splitting for better caching
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'ui-vendor': ['@elevenlabs/ui'],
          'utils-vendor': ['zod', 'fs-extra', 'glob', 'yaml'],
        },
      },
      external: [
        // Mark peer dependencies as external
        'configurator-sdk',
        'shadcn/ui',
      ],
    },

    // Bundle size optimization settings
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'],
      },
    },

    // Chunk size warnings aligned with performance targets
    chunkSizeWarningLimit: 800, // KB - helps maintain ≤120% bundle size target
  },

  // Development server configuration
  server: {
    port: 3000,
    host: true,
    open: true,
  },

  // Preview server configuration
  preview: {
    port: 4173,
    host: true,
  },

  // Environment variables
  envPrefix: 'VITE_',

  // CSS configuration
  css: {
    devSourcemap: true,
    modules: {
      localsConvention: 'camelCase',
    },
  },

  // TypeScript configuration for Vite
  esbuild: {
    target: 'es2022',
    format: 'esm',
    platform: 'browser',
  },

  // Optimization for development
  optimizeDeps: {
    include: ['react', 'react-dom', '@elevenlabs/ui', 'zod'],
  },
});
