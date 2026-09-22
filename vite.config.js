import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            '/api': {
                target: 'https://testing-api.naf-cloudsystem.de',
                changeOrigin: true,
                secure: false,
                configure: (proxy, _options) => {
                    proxy.on('proxyReq', (proxyReq, req, _res) => {
                        proxyReq.setHeader('Origin', 'https://testing-api.naf-cloudsystem.de');
                    });
                },
            },
        },
    },
})
