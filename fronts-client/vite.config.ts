import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  build: {
    manifest: true,
    rollupOptions: {
      input: '/src/index.tsx',
      output: {
        entryFileNames: `build/[name].js`,
        chunkFileNames: `build/[name].js`,
        assetFileNames: `build/[name].[ext]`,
      },
    },
    outDir: '../public/',
  },
  server: {
    origin: 'http://localhost:5173',
    // We depend upon this port number in a few places, so fail fast if we cannot allocate it.
    strictPort: true,
    fs: {
      allow: ['../public/fonts', './'],
    },
  },
});
