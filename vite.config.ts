import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from "vite";
// import react from "@vitejs/plugin-react";
import react from '@vitejs/plugin-react-swc';
import laravel from 'laravel-vite-plugin';
// import { ViteMinifyPlugin } from 'vite-plugin-minify';
// import mkcert from 'vite-plugin-mkcert';
// import tailwindcss from '@tailwindcss/vite';
// import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
	// The frontend dependencies live in packages/ui (Bun workspace), so Vite is
	// invoked from there with this root config. Pin the project root explicitly
	// so the Laravel plugin keeps emitting to <root>/public/build.
	root: fileURLToPath(new URL('.', import.meta.url)),
	plugins: [
		laravel({
			input: [
        'packages/ui/resources/css/app.scss', 
        'packages/ui/resources/ts/main.tsx',
        'packages/ui/resources/ts/admin.tsx'
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
    alias: [
      {
        find: '@programmeria/ui/feature',
        replacement: fileURLToPath(
          new URL('./packages/ui/resources/ts/core/feature/index.ts', import.meta.url)
        ),
      },
      { find: '@', replacement: '/packages/ui/resources/ts' },
      {
        // Feature packages (workspace: packages/*/resources/ts). Source .ts is
        // consumed directly by the bundler; entry point is resources/ts/index.ts.
        find: /^@programmeria\/([^/]+)$/,
        replacement: fileURLToPath(
          new URL('./packages/$1/resources/ts/index.ts', import.meta.url)
        ),
      },
    ],
  },
  server: {
    // port: 5175,
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
