/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        sage: {
          50: "#f6f7f4",
          100: "#e7e9e2",
          200: "#d1d5c7",
          300: "#b3b9a3",
          400: "#949b7e",
          500: "#7a8463",
          600: "#6b7556",
          700: "#5c6349",
          800: "#51583f",
          900: "#474d37",
        },
        vintage: {
          cream: "#fefcf5",
          beige: "#f5f0e8",
          brown: "#8b7355",
          rust: "#b87333",
          charcoal: "#3a3a3a",
        },
      },
      fontFamily: {
        serif: ["Georgia", "Times New Roman", "serif"],
        sans: ["system-ui", "Helvetica", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [],
};
