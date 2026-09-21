import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        // Body / UI — Space Grotesk (DESIGN_BRIEF §3)
        sans: ['var(--font-space-grotesk)', 'ui-sans-serif', 'system-ui', '-apple-system', 'sans-serif'],
        // Display serif — Fraunces (DESIGN_BRIEF §3)
        display: ['var(--font-fraunces)', 'Georgia', 'serif'],
      },
      colors: {
        // NovaMart warm editorial paper palette (DESIGN_BRIEF §2). No gradients, no indigo.
        paper: '#F6F1E8',
        card: '#FFFDF8',
        ink: '#191410',
        muted: '#857B6B',
        line: '#E3D9C6',
        sand: '#EDE5D3',
        accent: {
          DEFAULT: '#E4572E', // burnt orange — primary CTAs, links, sale badges
          ink: '#B23A17', // accent hover / pressed
        },
        forest: '#1E3A2F',
        gold: '#C99A2C', // star ratings only
        // Deprecated aliases: kept so screens not yet redesigned stay on-palette.
        // The old indigo (#4F46E5) is banned — these now point at the new tokens.
        brand: {
          DEFAULT: '#E4572E',
          dark: '#B23A17',
          ink: '#1E3A2F',
        },
        deal: '#E4572E',
      },
    },
  },
  plugins: [],
};

export default config;
