module.exports = {
  content: [
    './src/**/*.{html,js,svelte,ts}', // Scans all Svelte, JS, and TS files in the src folder
    './public/**/*.html', // Scans HTML files in the public folder (optional)
    './global.css', // Include global.css for custom styles or directives
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
