import { fileURLToPath, URL } from 'node:url';
import { resolve, dirname } from 'path';
import { version } from './package.json';
import fs from 'fs';
import sass from 'sass';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
    plugins: [
        vue(),
        {
            name: 'generate-version-json',
            apply: 'build',
            buildEnd() {
                const versionData = { version };
                const outputPath = resolve(__dirname, 'public', 'version.json');
                fs.writeFileSync(outputPath, JSON.stringify(versionData, null, 2));
                console.log(`Generated version.json at ${outputPath}`);
            },
        },
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
            '~bootstrap': resolve(__dirname, 'node_modules/bootstrap'),
        },
    },
    css: {
        preprocessorOptions: {
            scss: {
                implementation: sass,
                quietDeps: true,
            },
        },
    },
    define: {
        __APP_VERSION__: JSON.stringify(version),
    },
});
