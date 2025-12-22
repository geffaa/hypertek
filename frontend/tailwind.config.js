/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        goldman: ["Goldman", "sans-serif"],

        // ⚠️ WEB FIX — do NOT use Inter_400Regular here
        inter: ["Inter", "sans-serif"],
      },

      keyframes: {
        marqueeRight: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0%)" },
        },
      },

      animation: {
        marqueeRight: "marqueeRight 20s linear infinite",
      },

      colors: {
        gold: "#977C34",
        "dark-gold": "#493F26",
      },
    },
  },
  plugins: [],
};
