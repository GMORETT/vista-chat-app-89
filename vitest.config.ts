import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      exclude: [
        'node_modules/',
        'src/__tests__/',
        'src/__mocks__/',
        '**/*.d.ts',
        'src/vite-env.d.ts',
        'dist/',
        'public/',
        '*.config.*',
        'server/test-integration.js'
      ],
      thresholds: {
        global: {
          branches: 75,
          functions: 75,
          lines: 75,
          statements: 75
        },
        // Higher thresholds for security-critical paths
        'src/components/admin/inboxes/': {
          branches: 85,
          functions: 85,
          lines: 85,
          statements: 85
        },
        'src/api/': {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },
    // Security-focused test patterns
    include: [
      'src/__tests__/**/*.{test,spec}.{js,ts,tsx}',
      'src/__tests__/security/**/*.{test,spec}.{js,ts,tsx}',
      'src/__tests__/integration/**/*.{test,spec}.{js,ts,tsx}'
    ],
    // Performance monitoring
    slowTestThreshold: 1000,
    // Fail tests that expose sensitive data
    onConsoleLog: (log) => {
      const sensitivePatterns = [
        /[A-Z0-9]{32,}/, // Long tokens
        /EAA[A-Z0-9]+/, // Facebook tokens
        /sk_live_[A-Za-z0-9]+/, // Stripe live keys
      ];
      
      if (sensitivePatterns.some(pattern => pattern.test(log))) {
        throw new Error(`Potential sensitive data in console: ${log.substring(0, 100)}...`);
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 8080
  }
});