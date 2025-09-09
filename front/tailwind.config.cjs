// tailwind.config.js
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,html}"
  ],
  theme: {
    extend: {
      colors: {
        'crema': '#f9f7f1',
        'verde-principal': '#0b8f4a',
        'verde-claro': '#34d399',
        'verde-suave': '#dcfce7'
      }
    }
  },
  plugins: [],
}
