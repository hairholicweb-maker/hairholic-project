/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["var(--font-serif)", "Cormorant Garamond", "serif"],
        sans:  ["var(--font-sans)",  "Noto Sans JP",       "sans-serif"],
      },
      // 後方互換カラー（既存インラインスタイルとの共存用）
      colors: {
        "black-deep":    "#0d0d0d",
        "black-soft":    "#1a1a1a",
        "black-card":    "#141414",
        "gold":          "#d4af37",
        "gold-soft":     "#c9a961",
        "gold-light":    "#e8c547",
        "border-strong": "#2a2a2a",
        "border-soft":   "#3a3a3a",
      },
      tracking: {
        "widest-xl": "0.4em",
      },
    },
  },
  plugins: [],
};
