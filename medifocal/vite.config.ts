import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '../', '');
    return {
      base: '/', // Ensure absolute paths for assets
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [
        react(),
        // PWA plugin for mobile app support
        {
          name: 'pwa-manifest',
          generateBundle() {
            // Manifest is already in public/manifest.json
          }
        }
      ],
      build: {
        outDir: '../dist',
        assetsDir: 'assets',
        sourcemap: false,
        minify: 'esbuild',
        emptyOutDir: true,
        rollupOptions: {
          output: {
            manualChunks: {
              'react-vendor': ['react', 'react-dom'],
              'firebase-vendor': ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/functions'],
            },
            // Ensure chunk filenames are deterministic
            chunkFileNames: 'assets/[name]-[hash].js',
            entryFileNames: 'assets/[name]-[hash].js',
            assetFileNames: 'assets/[name]-[hash].[ext]'
          }
        },
        chunkSizeWarningLimit: 1000
      },
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env': '{}', // Polyfill for process.env
        'process': 'globalThis.process', // Reference to global process polyfill
        global: 'globalThis',
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
          crypto: 'crypto-browserify',
          process: 'process/browser',
        }
      },
      optimizeDeps: {
        exclude: ['ae_sdk'],
        include: ['process/browser', 'crypto-browserify'],
      }
    };
});
