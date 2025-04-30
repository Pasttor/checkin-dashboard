// postcss.config.js
/** @type {import('postcss-load-config').Config} */
module.exports = {
  plugins: {
    // Aquí usamos el paquete @tailwindcss/postcss en vez de tailwindcss
    '@tailwindcss/postcss': {},
    // Y autoprefixer tal cual
    autoprefixer: {},
  },
};

