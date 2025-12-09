/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Lato', 'sans-serif'],
        display: ['Montserrat', 'sans-serif'],
      },
      colors: {
        'brand-blue': {
          DEFAULT: '#007ac0',
          '50': '#e6f2f8',
          '100': '#cce5f1',
          '200': '#99cbe3',
          '300': '#66b1d5',
          '400': '#3397c7',
          '500': '#007ac0',
          '600': '#006299',
          '700': '#004973',
          '800': '#00314d',
          '900': '#001826',
        },
        'brand-green': '#6bb944',
        'brand-gray': '#f4f4f4',
      },
    },
  },
  plugins: [],
}
