import plugin from 'tailwindcss/plugin';

/** @type {import('tailwindcss').Config} */
export default {
  corePlugins: {
    preflight: false,
  },
  separator: '_',
  content: [
    // "./src/**/*.{js,ts,jsx,tsx}",
    // "./index.html",
    // "./tailwind_safelist.html", // For always compile some class

    './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
    './storage/framework/views/*.php',
    './resources/views/**/*.blade.php',
    './packages/**/resources/views/**/*.blade.php',
    './packages/**/resources/ts/**/*.tsx',
  ],
  // blocklist: [], 
  // safelist: [],
  theme: {
    extend: {
      zIndex: {
        '1': '1',
        '2': '2',
        '301': '301',
        '1051': '1051',
        '1052': '1052',
      },
      fontSize: {
        '0': '0',
      },
      colors: {
        /**
         * From https://getbootstrap.com/docs/5.3/utilities/text/#reset-color
         */
        'reset': 'inherit !important',
      },
      gridTemplateColumns: {
        'auto-1fr': 'auto 1fr',
      },
    },
  },
  plugins: [
    plugin(function({ addUtilities }){
      addUtilities({
        '.scrollbar-gutter-auto': {
          'scrollbar-gutter': 'auto' 
        },
        '.scrollbar-gutter-stable': { 
          'scrollbar-gutter': 'stable' 
        },
        '.scrollbar-gutter-both': { 
          'scrollbar-gutter': 'stable both-edges' 
        },

        '.content-v-hide': {
          'content-visibility': 'hidden',
        },
        '.content-v-auto': {
          'content-visibility': 'auto',
        },
        '.content-v-visible': {
          'content-visibility': 'visible',
        },

        '.disabled': {
          'pointer-events': 'none',
          'user-select': 'none',
          // 'interactivity': 'inert',
          '-webkit-user-drag': 'none',
          'opacity': '.4',
        },

        '.no-shadow': {
          'box-shadow': 'none !important',
        },

        '.mirror': {
          'transform': 'scaleX(-1)', // rotateY(180deg)
        },
      });
    }),
  ],
}
