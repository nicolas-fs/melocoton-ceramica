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
        // CAMBIO 6: Nueva paleta Pink Lemonade — reemplaza marrón/terracota
        melocoton: {
          50:  '#fff5f5',
          100: '#ffe0e0',
          200: '#ffbcbc',
          300: '#ff9090',
          400: '#F28C8C',  // Tickled Pink — color primario claro
          500: '#F25F5C',  // Pink Lemonade — color de acento principal
          600: '#e04040',
          700: '#c42828',
          800: '#9e1a1a',
          900: '#7a1010',
        },
        // tierra: neutros grises — se mantienen para texto y fondos
        tierra: {
          100: '#f5f5f5',
          200: '#e8e8e8',
          300: '#d0d0d0',
          400: '#a8a8a8',
          500: '#888888',
          600: '#666666',
          700: '#444444',
          800: '#222222',
          900: '#111111',
        },
        crema: {
          100: '#fefefe',
          200: '#fafafa',
        },
      },
      fontFamily: {
        // CAMBIO 2: Readex Pro para toda la web
        serif: ['Readex Pro', 'sans-serif'],
        sans:  ['Readex Pro', 'sans-serif'],
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
