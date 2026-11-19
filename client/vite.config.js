import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// En local se usa '/'. En GitHub Pages el workflow define VITE_BASE
// como '/HARMONTT/' para que encuentre los archivos JS y CSS.
export default defineConfig({
    base: process.env.VITE_BASE || '/',
    plugins: [react()],
});
