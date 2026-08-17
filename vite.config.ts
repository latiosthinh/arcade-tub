import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        hub: resolve(__dirname, 'index.html'),
        'safe-cracker': resolve(__dirname, 'games/safe-cracker/index.html'),
        'brick-blitz': resolve(__dirname, 'games/brick-blitz/index.html'),
        'sky-hopper': resolve(__dirname, 'games/sky-hopper/index.html'),
        'crate-catch': resolve(__dirname, 'games/crate-catch/index.html'),
        'type-strike': resolve(__dirname, 'games/type-strike/index.html'),
      },
    },
  },
});
