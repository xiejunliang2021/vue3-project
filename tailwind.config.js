/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        matrix: {
          primary: '#00FF41',
          dark: '#008F11',
          bg: '#0D0208',
          dim: '#003B00',
        },
        scifi: {
          bg: '#020B1C',
          glass: 'rgba(16, 33, 65, 0.6)',
          accent: '#00F3FF',
          border: 'rgba(0, 243, 255, 0.3)',
        }
      },
      fontFamily: {
        mono: ['Consolas', 'Courier New', 'monospace'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
