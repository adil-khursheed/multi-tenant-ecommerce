import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'node',
    setupFiles: ['./vitest.setup.ts'],
    include: ['tests/int/**/*.int.spec.ts'],
    testTimeout: 120000,
    hookTimeout: 120000,
    // Spec files share the same MongoDB database; run them sequentially to
    // avoid concurrent transactions tripping Atlas "Please retry your
    // operation" errors (especially on the free tier).
    fileParallelism: false,
  },
})
