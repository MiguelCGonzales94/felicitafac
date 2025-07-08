/**
 * Configuración de Vite - FELICITAFAC
 * Sistema de Facturación Electrónica para Perú
 * Configuración optimizada para desarrollo y producción
 */

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Configuración del servidor de desarrollo
  server: {
    port: 3000,
    host: '0.0.0.0',
    open: false,
    cors: true,
    proxy: {
      // Proxy para el backend Django
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      },
      // Proxy para archivos estáticos del backend si es necesario
      '/media': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false
      },
      '/static': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false
      }
    }
  },

  // Configuración del preview
  preview: {
    port: 3000,
    host: '0.0.0.0',
    open: false
  },

  // Resolución de alias
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/componentes'),
      '@/pages': path.resolve(__dirname, './src/paginas'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/services': path.resolve(__dirname, './src/servicios'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/assets': path.resolve(__dirname, './src/assets'),
      '@/context': path.resolve(__dirname, './src/context'),
      '@/router': path.resolve(__dirname, './src/router')
    }
  },

  // Configuración de CSS
  css: {
    postcss: './postcss.config.js',
    devSourcemap: true
  },

  // Configuración del build
  build: {
    target: 'es2020',
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: process.env.NODE_ENV === 'development',
    minify: 'terser',
    
    // Configuración de chunk splitting para mejor caching
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'query-vendor': ['@tanstack/react-query'],
          'ui-vendor': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'chart-vendor': ['recharts', 'chart.js'],
          'utils-vendor': ['lodash', 'date-fns', 'clsx', 'tailwind-merge'],
          
          // App chunks
          'auth': ['./src/context/AuthContext', './src/servicios/authAPI'],
          'admin': ['./src/hooks/useDashboardAdmin', './src/hooks/useNavegacionAdmin'],
          'components-admin': [
            './src/componentes/admin/SidebarAdmin',
            './src/componentes/admin/HeaderAdmin',
            './src/componentes/admin/WidgetMetrica'
          ]
        },
        
        // Configuración de nombres de archivos
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId 
            ? chunkInfo.facadeModuleId.split('/').pop() 
            : 'chunk';
          return `js/${facadeModuleId}-[hash].js`;
        },
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name!.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `img/[name]-[hash][extname]`;
          }
          if (/woff2?|eot|ttf|otf/i.test(ext)) {
            return `fonts/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        entryFileNames: 'js/[name]-[hash].js'
      }
    },

    // Configuración de Terser
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: process.env.NODE_ENV === 'production'
      }
    },

    // Configuración de assets
    assetsInlineLimit: 4096, // 4kb
    
    // Reportar el tamaño del bundle
    reportCompressedSize: true,
    chunkSizeWarningLimit: 1000
  },

  // Variables de entorno
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString())
  },

  // Configuración de optimización de dependencias
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'react-hook-form',
      '@tanstack/react-query',
      'zod',
      'clsx',
      'tailwind-merge',
      'lucide-react',
      'recharts',
      'lodash',
      'date-fns'
    ],
    exclude: [
      // Excluir dependencias que pueden causar problemas
    ]
  },

  // Configuración específica para testing
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true
  },

  // Configuración de compatibilidad
  esbuild: {
    target: 'es2020',
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  }
});