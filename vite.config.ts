import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rolldownOptions: {
      output: {
        // Split the big, rarely-changing dependencies into their own chunks.
        // This does not reduce first-load bytes — they're all still needed on
        // first paint — but it means shipping an app change no longer forces
        // everyone to re-download Firebase and React along with it.
        advancedChunks: {
          groups: [
            { name: 'firebase', test: /[\/]node_modules[\/]@?firebase[\/]/ },
            { name: 'motion', test: /[\/]node_modules[\/](motion|framer-motion)[\/]/ },
            {
              name: 'react-vendor',
              test: /[\/]node_modules[\/](react|react-dom|scheduler|react-router|react-router-dom)[\/]/,
            },
          ],
        },
      },
    },
  },
  test: { environment: 'node' },
})
