import { defineConfig } from 'vite'
import { port, hmr, base } from './src/proxy'
import path from 'path'

export default defineConfig({
    server: {
        port,
        hmr: false,
        watch: {
            usePolling: true,
        }
    },
    base,
    build: {
        rollupOptions: {
            input: {
                index: path.resolve(__dirname, 'index.html'),
                part: path.resolve(__dirname, 'part.html')
            }
        }
    }
})