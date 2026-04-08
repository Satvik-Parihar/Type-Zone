import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
        display: ['Poppins', 'sans-serif'],
      },
      colors: {
        // Dark Pro Theme
        'dark-pro': {
          bg: '#0a0e27',
          card: '#131829',
          border: '#1e2749',
          text: '#e4e6eb',
          muted: '#8892b0',
          accent: '#00d4ff',
          cursor: '#00d4ff',
          error: '#ff4757',
        },
        // Neon Cyberpunk Theme
        'neon-cyber': {
          bg: '#0a0013',
          card: '#16001b',
          border: '#2d004d',
          text: '#ff00ff',
          muted: '#cc00ff',
          accent: '#00ffff',
          cursor: '#00ffff',
          error: '#ff0066',
        },
        // Soft Pastel Theme
        'soft-pastel': {
          bg: '#faf9f7',
          card: '#ffffff',
          border: '#e8e3dd',
          text: '#2c2c2c',
          muted: '#9b9b9b',
          accent: '#ff6b9d',
          cursor: '#ff6b9d',
          error: '#ff6b6b',
        },
        // AMOLED Black Theme
        'amoled-black': {
          bg: '#000000',
          card: '#0a0a0a',
          border: '#1a1a1a',
          text: '#ffffff',
          muted: '#808080',
          accent: '#ff6b35',
          cursor: '#ff6b35',
          error: '#ff4444',
        },
        // Minimal White Theme
        'minimal-white': {
          bg: '#ffffff',
          card: '#f5f5f5',
          border: '#e0e0e0',
          text: '#1a1a1a',
          muted: '#757575',
          accent: '#1976d2',
          cursor: '#1976d2',
          error: '#d32f2f',
        },
        // Hacker Green Theme
        'hacker-green': {
          bg: '#0d1117',
          card: '#161b22',
          border: '#30363d',
          text: '#00ff00',
          muted: '#58a6ff',
          accent: '#00ff00',
          cursor: '#00ff00',
          error: '#ff4444',
        },
        // Sunset Gradient Theme
        'sunset-gradient': {
          bg: '#1a1a2e',
          card: '#16213e',
          border: '#0f3460',
          text: '#eaeaea',
          muted: '#fc8803',
          accent: '#ff6b35',
          cursor: '#ff6b35',
          error: '#ff4757',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in',
        'slide-up': 'slideUp 0.4s ease-out',
        'slideIn': 'slideIn 0.4s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'cursor-blink': 'cursorBlink 1s ease-in-out infinite',
        'shake': 'shake 0.3s ease-in-out',
        'bounce-smooth': 'bounceSmooth 0.6s ease-out',
        'float': 'float 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideIn: {
          '0%': { transform: 'translateX(400px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 212, 255, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 212, 255, 0.8)' },
        },
        cursorBlink: {
          '0%, 49%': { opacity: '1' },
          '50%, 100%': { opacity: '0' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-5px)' },
          '75%': { transform: 'translateX(5px)' },
        },
        bounceSmooth: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '50%': { opacity: '1' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        glow: {
          '0%, 100%': { opacity: '0.6' },
          '50%': { opacity: '1' },
        },
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '12px',
        lg: '16px',
        xl: '24px',
      },
      spacing: {
        '128': '32rem',
        '144': '36rem',
      },
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      typography: {
        DEFAULT: {
          css: {
            color: 'inherit',
          },
        },
      },
    },
  },
  plugins: [forms],
  darkMode: 'class',
};
