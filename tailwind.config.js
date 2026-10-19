/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          wegrow: '#2F7D4F',
          'wegrow-dark': '#23603C',
          skillcampus: '#3A47C4',
          'skillcampus-dark': '#2A36A8',
          bschool: '#8E2C3C',
          'bschool-dark': '#701F2D',
          navy: '#0A2A8C',
          orange: '#FF6A13',
          accent: '#5B5FC7',
          'accent-hover': '#4F52B2'
        }
      },
      fontFamily: {
        sans: ['"Open Sans"', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
