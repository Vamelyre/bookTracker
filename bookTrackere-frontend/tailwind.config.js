/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"  
  ],
  theme: {
    extend: {
      colors: {
        'custom-pink': {
          100: '#ffe2f1',
          200: '#ffd3ea',
          300: '#ffb9de',
          400: '#ffaad7',
          500: '#ff9dd0',
        },
        'custom-cream': '#ffffd8',
      },
    },
  },
  plugins: [],
};
