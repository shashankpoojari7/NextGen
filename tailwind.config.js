// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        text: '#f9fbfb',
        background: '#161c1b',
        primary: '#97bfb4',
        secondary: '#f5eedc',
        accent: '#dd4a48',
      },
    },
  },
  plugins: [],
};
