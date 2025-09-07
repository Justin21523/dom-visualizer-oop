import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // Base URL for the application
  base: '/',

  // Development server configuration
  server: {
    port: 3000,
    host: true,
    open: true,
    cors: true,
    hmr: {
      overlay: true
    }
  },

  // Build configuration
  build: {
    target: 'es2020',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    minify: 'terser',
    cssCodeSplit: true,

    // Bundle analysis
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      },
      output: {
        manualChunks: {
          // Vendor libraries
          vendor: ['lodash-es'],

          // Core application
          core: [
            './src/core/DOMVisualizerApp.js',
            './src/core/ModuleManager.js',
            './src/core/StateManager.js',
            './src/core/EventBus.js'
          ],

          // Feature modules (code splitting)
          foundation: ['./src/modules/foundation/index.js'],
          events: ['./src/modules/events/index.js'],
          dom: ['./src/modules/dom/index.js'],
          boxmodel: ['./src/modules/boxmodel/index.js'],
          performance: ['./src/modules/performance/index.js'],
          learning: ['./src/modules/learning/index.js']
        },

        // Asset naming
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const extType = info[info.length - 1];

          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name)) {
            return `assets/images/[name]-[hash].${extType}`;
          }
          if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name)) {
            return `assets/fonts/[name]-[hash].${extType}`;
          }
          if (/\.(css)$/i.test(assetInfo.name)) {
            return `assets/css/[name]-[hash].${extType}`;
          }
          return `assets/[name]-[hash].${extType}`;
        }
      }
    },

    // Terser configuration for better minification
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },

  // CSS preprocessing
  css: {
    devSourcemap: true,
    preprocessorOptions: {
      css: {
        charset: false
      }
    }
  },

  // Path resolution
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@core': resolve(__dirname, 'src/core'),
      '@modules': resolve(__dirname, 'src/modules'),
      '@components': resolve(__dirname, 'src/components'),
      '@utils': resolve(__dirname, 'src/utils'),
      '@styles': resolve(__dirname, 'src/styles'),
      '@constants': resolve(__dirname, 'src/constants'),
      '@types': resolve(__dirname, 'src/types'),
      '@tests': resolve(__dirname, 'tests')
    }
  },

  // Environment variables
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString())
  },

  // Plugin configuration
  plugins: [],

  // Optimization configuration
  optimizeDeps: {
    include: ['lodash-es']
  },

  // Worker configuration
  worker: {
    format: 'es'
  }
});