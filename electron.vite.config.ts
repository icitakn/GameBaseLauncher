import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'
import react from '@vitejs/plugin-react'
import { copyFileSync } from 'fs'

export default defineConfig({
  main: {
    build: {
      sourcemap: true,
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/main/main.ts'),
          worker: resolve(__dirname, 'src/main/worker.ts')
        }
      }
    },
    plugins: [
      externalizeDepsPlugin(),
      {
        name: 'copy-licenses',
        closeBundle() {
          copyFileSync('LICENSE', 'out/main/LICENSE')
          copyFileSync('THIRD_PARTY_LICENSES.txt', 'out/main/THIRD_PARTY_LICENSES.txt')
        }
      }
    ]
  },
  preload: {
    build: {
      sourcemap: true,
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/preload/preload.ts')
        }
      }
    },
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    build: {
      sourcemap: true
    },
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/'),
        '@shared': resolve('src/shared')
      }
    },
    plugins: [react()]
  }
})
