// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // This line tells Tailwind to scan all JS, JSX, TS, TSX files in src folder
    "./public/index.html",       // You might also want to scan your public HTML file
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}