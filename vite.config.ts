import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import react from '@vitejs/plugin-react-swc';
import mkcert from 'vite-plugin-mkcert';


// https://vitejs.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    // Allows using React dev server along with building a React application with Vite.
    // https://npmjs.com/package/@vitejs/plugin-react-swc
    react(),
    // Allows using the compilerOptions.paths property in tsconfig.json.
    // https://www.npmjs.com/package/vite-tsconfig-paths
    tsconfigPaths(),
    // Create a custom SSL certificate valid for the local machine.
    // https://www.npmjs.com/package/vite-plugin-mkcert
    mkcert(),
  ],
  publicDir: './public',
  server: {
    host: true, // Expose to the local network
    proxy: {
      '/api': {
        target: 'http://5.35.10.90:5000', // Your backend server
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''), // Remove /api prefix
      },
    },
  },
});

