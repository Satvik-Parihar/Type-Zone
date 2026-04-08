import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        card: 'var(--color-card)',
        text: {
          DEFAULT: 'var(--color-text)',
          secondary: 'var(--color-text-secondary)',
        },
        accent: 'var(--color-accent)',
        'accent-alt': 'var(--color-accent-alt)',
        error: 'var(--color-error)',
        correct: 'var(--color-correct)',
        cursor: 'var(--color-cursor)',
        border: 'var(--color-border)',
        'border-dark': 'var(--color-border-dark)',
        hover: 'var(--color-hover)',
      },
      backdropBlur: {
        xs: '2px',
      },
      borderRadius: {
        '4xl': '2rem',
      },
    },
  },
  plugins: [forms],
  darkMode: 'class',
};
