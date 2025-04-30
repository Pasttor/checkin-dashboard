// postcss.config.js
/** @type {import('postcss-load-config').Config} */
module.exports = {
  plugins: {
    tailwindcss: {},      // ESTE es el plugin que Next espera
    autoprefixer: {},
  },
};
