import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#dbe7ff',
          500: '#4f6bed',
          600: '#3b55d9',
          700: '#2f44b0',
        },
      },
      fontFamily: {
        sans: ['var(--font-jakarta)', 'Segoe UI', 'sans-serif'],
        display: ['var(--font-sora)', 'Segoe UI', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
