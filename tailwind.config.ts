import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        melocoton: {
          50:  '#fdf8f3',
          100: '#faecd8',
          200: '#f3d4ac',
          300: '#e9b57a',
          400: '#df9a52',
          500: '#d4813a',
          600: '#c06930',
          700: '#9e512a',
          800: '#7e4028',
          900: '#673625',
        },
        tierra: {
          100: '#f0ebe3',
          200: '#dfd5c5',
          300: '#c9b99f',
          400: '#b09a7a',
          500: '#957d5e',
          600: '#7a634a',
          700: '#5e4c38',
          800: '#3e3025',
          900: '#1e1812',
        },
        crema: {
          100: '#fefef9',
          200: '#fdfbef',
        },
      },
      fontFamily: {
        // Usa las variables CSS que genera next/font/google en layout.tsx
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        sans:  ['var(--font-sans)',  'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in':  'fadeIn 0.6s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'float':    'float 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',     opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-8px)' },
        },
      },
    },
  },
  plugins: [],
}
export default config
