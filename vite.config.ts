import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";
import react from '@vitejs/plugin-react-swc';
import laravel from 'laravel-vite-plugin';
// import { ViteMinifyPlugin } from 'vite-plugin-minify';
// import mkcert from 'vite-plugin-mkcert';
// import tailwindcss from '@tailwindcss/vite';
// import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
	plugins: [
		laravel({
			input: [
        'resources/css/app.scss', 
        'resources/ts/main.tsx',
        // 'resources/ts/admin.tsx'
      ],
			refresh: true,
      // buildDirectory: 'build', // outputs to public/build
		}),
    // ViteMinifyPlugin({
    //   // You can pass options to html-minifier-terser here if needed
    //   // For most cases, leaving it empty is fine.
    // }),
    react(),
    // mkcert(),
		// tailwindcss(),
	],
  resolve: {
    alias: {
      '@': '/resources/ts',
    },
  },
  server: {
    // port: 5175,
    // host: true,
    host: '127.0.0.1', // ✅ Force IPv4
    hmr: {
      host: 'localhost', // ✅ Prevent [::] fallback
    },
    // From laravel source
    watch: {
      ignored: ['**/storage/framework/views/**'],
    },
  },
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        // drop_console: true,
        arrows: true,       // Converts functions to arrow functions
        comparisons: true,  // Optimizes `typeof` checks, if false will Disables '==' optimization
        conditionals: true, // Flattens nested ternaries
        toplevel: true,     // Minifies top-level functions
      },
      format: {
        comments: false, // Removes comments
      },
    },
    // reportCompressedSize: false, // For fast build
  },
});
