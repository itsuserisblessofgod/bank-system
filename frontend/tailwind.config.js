/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef6ff',
          500: '#1e6fff',
          600: '#1657d9',
          700: '#1144aa',
        },
      },
    },
  },
  plugins: [],
};
