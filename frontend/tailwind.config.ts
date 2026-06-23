import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d5fd',
          300: '#a5b8fb',
          400: '#8094f8',
          500: '#5c6ef3',
          600: '#4350e8',
          700: '#3640d4',
          800: '#2e35ab',
          900: '#2a3186',
          950: '#1a1f55',
        },
        slate: {
          850: '#162032',
        },
      },
      fontFamily: {
        sans: ['Inter var', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      boxShadow: {
        'glow': '0 0 20px rgba(92, 110, 243, 0.3)',
        'glow-lg': '0 0 40px rgba(92, 110, 243, 0.2)',
      },
    },
  },
  plugins: [],
};

export default config;
