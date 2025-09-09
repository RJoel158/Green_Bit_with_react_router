// postcss.config.cjs
module.exports = {
  plugins: {
    '@tailwindcss/postcss': {}, // <--- nuevo plugin requerido por Tailwind v4+
    autoprefixer: {},
  },
};
