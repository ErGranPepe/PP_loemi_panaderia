import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  css: {
    preprocessorOptions: {
      // Add global CSS here if needed
    },
  },
  daisyui: {
    themes: ["light"],
  },
});
