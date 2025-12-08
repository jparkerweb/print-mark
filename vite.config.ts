import { defineConfig } from 'vite'
import { resolve } from 'path'
import { copyFileSync, mkdirSync, readdirSync } from 'fs'

// Plugin to copy theme CSS files to build output
function copyThemeCSS() {
  return {
    name: 'copy-theme-css',
    closeBundle() {
      const themesDir = resolve(__dirname, 'src/client/styles/themes')
      const outDir = resolve(__dirname, 'dist/client/styles/themes')

      // Create output directory
      mkdirSync(outDir, { recursive: true })

      // Copy all CSS files from themes directory
      const files = readdirSync(themesDir)
      for (const file of files) {
        if (file.endsWith('.css')) {
          copyFileSync(resolve(themesDir, file), resolve(outDir, file))
        }
      }

      console.log('Theme CSS files copied to dist/client/styles/themes/')
    },
  }
}

export default defineConfig({
  root: 'src/client',
  publicDir: resolve(__dirname, 'public'),
  build: {
    outDir: resolve(__dirname, 'dist/client'),
    emptyOutDir: true,
  },
  resolve: {
    alias: {
      '@shared': resolve(__dirname, 'src/shared'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  plugins: [copyThemeCSS()],
})
