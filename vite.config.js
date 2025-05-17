import { fileURLToPath, URL } from 'node:url';
import { resolve } from 'path';
import { version } from './package.json';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        {
            name: 'generate-version-json',
            apply: 'build',
            buildEnd() {
                const versionData = { version };
                const outputPath = path.resolve(__dirname, 'public', 'version.json');
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
    define: {
        __APP_VERSION__: JSON.stringify(version),
    },
});
