/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // My Trade Status has its own identity. Deliberately not Rosebourne's
        // #4a7ba7 — a trade fitting this to their own customers should not be
        // looking at another firm's brand colour.
        brand: {
          50: '#eef4fb', 100: '#d7e6f6', 200: '#b3cfee',
          500: '#2f6fb5', 600: '#255a95', 700: '#1d4675', 900: '#122a46',
        },
      },
    },
  },
  plugins: [],
}
