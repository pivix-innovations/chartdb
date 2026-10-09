import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        visualizer({
            filename: './stats/stats.html',
            open: false,
        }),
    ],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    build: {
        rollupOptions: {
            external: (id) => /__test__/.test(id),
            output: {
                assetFileNames: (assetInfo) => {
                    if (
                        assetInfo.names &&
                        assetInfo.originalFileNames.some((name) =>
                            name.startsWith('src/assets/templates/')
                        )
                    ) {
                        return 'assets/[name][extname]';
                    }
                    return 'assets/[name]-[hash][extname]';
                },
            },
        },
    },
});
