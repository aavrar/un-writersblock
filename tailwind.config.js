/** @type {import('tailwindcss').Config} */
// Force rebuild
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Georgia', '"Times New Roman"', 'serif'],
      },
    },
  },
  plugins: [],
}

