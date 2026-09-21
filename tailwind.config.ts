import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        // NovaMart design tokens (see CONTRACT.md)
        brand: {
          DEFAULT: '#4F46E5', // indigo-600
          dark: '#4338CA', // indigo-700 (hover)
          ink: '#1E1B4B', // dark accent for footer / hero gradients
        },
        deal: '#FBBF24', // amber-400, deal/sale accent
      },
    },
  },
  plugins: [],
};

export default config;
