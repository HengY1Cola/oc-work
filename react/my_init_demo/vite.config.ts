import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react-swc'
import {viteMockServe} from "vite-plugin-mock";

export default defineConfig({
    base: './',
    plugins: [
        react(),
        viteMockServe({
            mockPath: 'mock',
            enable: !!process.env.USE_MOCK,
            logger: false,
        }),
    ],
    css: {
        preprocessorOptions: {
            less: {
                javascriptEnabled: true,
                charset: false,
                additionalData: '@import "./src/style/common.less";'
            }
        }
    },
    build: {
        terserOptions: {
            compress: {
                drop_console: true
            }
        },
        outDir: 'dist',
        assetsDir: 'assets'
    }
})