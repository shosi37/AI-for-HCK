module.exports = {
  // Use the new PostCSS adapter for Tailwind
  plugins: [
    require('@tailwindcss/postcss'),
    require('autoprefixer'),
  ],
}
