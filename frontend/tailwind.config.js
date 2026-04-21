/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sap: {
          blue: '#0070F2',
          darkblue: '#0040B0',
          gold: '#F0AB00',
          gray: '#F5F6F7',
          darkgray: '#32363A',
          border: '#D9D9D9',
        },
      },
    },
  },
  plugins: [],
}
