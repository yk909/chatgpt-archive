/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{ts,tsx,html}"],
  theme: {
    extend: {
      backgroundColor: {
        "dark-1": "rgb(52, 53, 65)",
        "dark-2": "rgb(32, 33, 35)",
        "card-hover": "#2A2B32",
      },
      colors: {
        "white-1": "rgb(217, 217, 227)",
      },
    },
  },
  plugins: [],
};
