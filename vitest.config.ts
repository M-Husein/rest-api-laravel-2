import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: [
      {
        find: '@programmeria/ui/feature',
        replacement: fileURLToPath(
          new URL('./packages/ui/resources/ts/core/feature/index.ts', import.meta.url)
        ),
      },
      {
        find: '@',
        replacement: fileURLToPath(new URL('./packages/ui/resources/ts', import.meta.url)),
      },
      {
        find: /^@programmeria\/([^/]+)$/,
        replacement: fileURLToPath(
          new URL('./packages/$1/resources/ts/index.ts', import.meta.url)
        ),
      },
    ],
  },
  test: {
    include: ['tests/frontend/**/*.test.ts'],
    environment: 'node',
  },
});
