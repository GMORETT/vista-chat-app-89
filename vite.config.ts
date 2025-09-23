import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { analyzer } from "vite-bundle-analyzer";

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => {
  // MFE development mode
  if (command === 'serve' && process.env.MFE_DEV) {
    return {
      server: {
        host: "::",
        port: 3000,
        open: '/playground.html',
      },
      plugins: [react()],
      resolve: {
        alias: {
          "@": path.resolve(__dirname, "./src"),
        },
      },
    };
  }

  return {
    server: {
      host: "::",
      port: 8080,
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
          secure: false,
        },
      },
    },
    plugins: [
      react(), 
      mode === "development" && componentTagger(),
      process.env.ANALYZE ? analyzer() : null
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-select']
          }
        }
      },
      chunkSizeWarningLimit: 1000,
      sourcemap: false,
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom', 'zustand']
    },
  };
});
