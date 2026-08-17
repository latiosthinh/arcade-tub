import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@arcade-carnival/playables-adapter': resolve(__dirname, 'packages/playables-adapter/src/index.ts'),
      '@arcade-carnival/game-engine': resolve(__dirname, 'packages/game-engine/src/index.ts'),
    },
  },
  preview: {
    allowedHosts: true,
  },
  build: {
    rollupOptions: {
      input: {
        hub: resolve(__dirname, 'index.html'),
        embed: resolve(__dirname, 'embed.html'),
        'safe-cracker': resolve(__dirname, 'games/safe-cracker/index.html'),
        'brick-blitz': resolve(__dirname, 'games/brick-blitz/index.html'),
        'sky-hopper': resolve(__dirname, 'games/sky-hopper/index.html'),
        'crate-catch': resolve(__dirname, 'games/crate-catch/index.html'),
        'type-strike': resolve(__dirname, 'games/type-strike/index.html'),
      },
    },
  },
});
