import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [ react()],
  base: '/assets/notifications-client',
  build: {
    manifest: true,
    rollupOptions: {
      input: '/src/index.tsx',
      output: {
        entryFileNames: `[name].js`,
        chunkFileNames: `[name].js`,
        assetFileNames: `[name].[ext]`,
      },
    },
    outDir: '../public/notifications-client/dist',
    sourcemap: true,
    emptyOutDir: true,
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
