import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

// See https://wxt.dev/api/config.html
export default defineConfig({
    srcDir: 'src',
    extensionApi: 'chrome',
    modules: ['@wxt-dev/module-react'],
    vite: () => ({
        plugins: [tailwindcss()],
    }),
});
