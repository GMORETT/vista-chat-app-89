import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/mfe/publicApi.ts'),
      name: 'SolabsMessages',
      formats: ['iife', 'es'],
      fileName: (format) => {
        const suffix = format === 'es' ? '.esm' : '';
        return `solabs-messages${suffix}.js`;
      },
    },
    outDir: 'dist/lib',
    rollupOptions: {
      external: [],
      output: {
        globals: {},
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') {
            return '../styles/solabs-messages.css';
          }
          return assetInfo.name || '';
        },
      },
    },
    cssCodeSplit: false,
  },
  define: {
    'process.env.NODE_ENV': '"production"',
  },
});