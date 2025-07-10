import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      'jspdf': path.resolve(__dirname, 'node_modules/jspdf/dist/jspdf.umd.js'),
    },
  },
  server: {
    host: '0.0.0.0',
  },
});
