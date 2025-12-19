import flowbite from 'flowbite/plugin';
import tailwindcss from 'tailwindcss';
import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/flowbite/**/*.js",
    "./node_modules/flowbite-react/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          green: '#008037',
          yellow: '#F8BF0F',
          blue: '#051836',
        },
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: theme('colors.gray.700'),
            h2: {
              color: theme('colors.gray.900'),
              fontWeight: '700',
              marginTop: '2rem',
              marginBottom: '1rem',
            },
            h3: {
              color: theme('colors.gray.900'),
              fontWeight: '600',
              marginTop: '1.5rem',
              marginBottom: '0.75rem',
            },
            a: {
              color: theme('colors.brand.blue'),
              '&:hover': {
                color: theme('colors.brand.green'),
              },
            },
            strong: {
              color: theme('colors.brand.blue'),
            },
            blockquote: {
              borderLeftColor: theme('colors.brand.blue'),
              backgroundColor: theme('colors.brand.blue') + '0D', // 5% opacity
            },
          },
        },
        dark: {
          css: {
            color: theme('colors.gray.300'),
            h2: {
              color: theme('colors.white'),
            },
            h3: {
              color: theme('colors.white'),
            },
            a: {
              color: theme('colors.brand.green'),
              '&:hover': {
                color: theme('colors.brand.yellow'),
              },
            },
            strong: {
              color: theme('colors.brand.green'),
            },
            blockquote: {
              borderLeftColor: theme('colors.brand.green'),
              backgroundColor: theme('colors.brand.green') + '1A', // 10% opacity
            },
          },
        },
      }),
    },
  },
  plugins: [
    flowbite,
    typography
  ],
  corePlugins: {
    version: false
  }
}

