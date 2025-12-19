/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Add font family configuration
      fontFamily: {
        'goldman': ['Goldman', 'sans-serif'],
      },
      // Optional: Add custom colors if needed
      colors: {
        'gold': '#977C34',
        'dark-gold': '#493F26',
      },
    },
  },
  plugins: [],
}