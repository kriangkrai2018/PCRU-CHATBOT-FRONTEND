import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const devHost = env.VITE_DEV_HOST || 'project.3bbddns.com'
  const devPort = Number(env.VITE_DEV_PORT || '3000')
 
  return {
    plugins: [
      vue(),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
    // 🚀 Apple-style Performance Optimizations
    build: {
      // Enable minification with terser for best compression
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true, // Remove console.log in production
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.info'],
        },
      },
      // Code splitting for faster initial load
      rollupOptions: {
        output: {
          // Split vendor chunks for better caching
          manualChunks: {
            'vue-vendor': ['vue', 'vue-router'],
            'axios-vendor': ['axios'],
          },
          // Optimize chunk file names for caching
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
        },
      },
      // Increase chunk size warning limit (Apple sites often have larger chunks)
      chunkSizeWarningLimit: 1000,
      // Enable source maps for debugging (disable in production if needed)
      sourcemap: false,
      // CSS code splitting
      cssCodeSplit: true,
      // Target modern browsers for smaller bundle
      target: 'es2020',
      // Copy gfx CSS files to assets folder
      copyPublicDir: true,
    },
    // Dev server optimizations
    server: {
      // Enable HTTP/2 for parallel requests
      https: false,
      host: devHost,
      port: devPort,
      strictPort: true,
      allowedHosts: ['project.3bbddns.com'],
      // Warm up frequently used files
      warmup: {
        clientFiles: [
          './src/views/ChatbotView.vue',
          './src/assets/chatbot-view.css',
        ],
      },
    },
    // Optimize dependencies
    optimizeDeps: {
      include: ['vue', 'vue-router', 'axios'],
      // Exclude large dependencies that don't need pre-bundling
      exclude: [],
    },
    // Enable CSS preprocessing optimizations
    css: {
      devSourcemap: true,
      preprocessorOptions: {},
    },
  }
})
