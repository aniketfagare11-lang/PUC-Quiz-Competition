/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0A0A0A',
          card: '#171717',
          border: '#262626',
          borderHover: '#383838',
          text: '#FFFFFF',
          muted: '#A3A3A3',
        },
        accent: {
          orange: '#FDBA74',
          orangeHover: '#FED7AA',
          orangeDark: '#FB923C',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      keyframes: {
        'fade-in': { '0%': { opacity: 0, transform: 'translateY(6px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
      },
      animation: { 'fade-in': 'fade-in 0.25s ease-out' },
    },
  },
  plugins: [],
};
