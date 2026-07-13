/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#1E2A47',
          light: '#2E3E63',
          dark: '#141D33',
        },
        paper: '#FAF9F5',
        parchment: '#F1EEE4',
        sage: {
          DEFAULT: '#6E8F72',
          light: '#8CAA8F',
          dark: '#4F6B53',
        },
        gold: {
          DEFAULT: '#B08D57',
          light: '#CBAE81',
        },
        brick: {
          DEFAULT: '#A6432E',
          light: '#C15A42',
        },
        slate: {
          DEFAULT: '#5B6472',
        },
      },
      fontFamily: {
        display: ['"Source Serif 4"', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(30, 42, 71, 0.06), 0 4px 12px rgba(30, 42, 71, 0.08)',
      },
    },
  },
  plugins: [],
};
