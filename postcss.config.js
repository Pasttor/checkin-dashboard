// postcss.config.js
/** @type {import('postcss-load-config').Config} */
module.exports = {
    plugins: [
      // Llamamos a la función exportada por @tailwindcss/postcss
      require('@tailwindcss/postcss')(),
      // Llamamos a la función de autoprefixer
      require('autoprefixer')(),
    ],
  };
  