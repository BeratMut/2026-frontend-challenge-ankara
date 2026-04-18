/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "dark-bg": "#1a1a2e",
        "dark-primary": "#0f3460",
        "dark-accent": "#3b82f6",
      },
      width: {
        "7/10": "70%",
        "3/10": "30%",
      },
    },
  },
  plugins: [],
};
