import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@arcade-carnival/playables-adapter': resolve(__dirname, 'packages/playables-adapter/src/index.ts'),
      '@arcade-carnival/game-engine': resolve(__dirname, 'packages/game-engine/src/index.ts'),
    },
  },
  test: {
    environment: 'happy-dom',
  },
});
