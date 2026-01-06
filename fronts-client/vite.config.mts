import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  base: '/assets/fronts-client-v2',
  build: {
    manifest: true,
    rollupOptions: {
      input: '/src/index.tsx',
      output: {
        entryFileNames: `dist/[name].js`,
        chunkFileNames: `dist/[name].js`,
        assetFileNames: `dist/[name].[ext]`,
      },
    },
    outDir: '../public/fronts-client-v2',
    sourcemap: true
  },
  server: {
    origin: 'http://localhost:5173',
    // We depend upon this port number in a few places, so fail fast if we cannot allocate it.
    strictPort: true,
    fs: {
      allow: ['../public/fonts', './'],
    },
    cors: {
        origin: "https://fronts.local.dev-gutools.co.uk"
    },
  }
});
