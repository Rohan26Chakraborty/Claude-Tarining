import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: [
      'frontend/src/__tests__/**/*.test.ts',
      'backend/src/__tests__/**/*.test.ts',
    ],
    environment: 'node',
    unstubGlobals: true,   // auto-restore vi.stubGlobal between tests
    clearMocks: true,      // auto-clear mock call history between tests
  },
});
