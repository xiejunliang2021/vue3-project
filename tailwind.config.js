/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Modern Tech & SaaS Slate Palette
        slate: {
          850: '#111827',
          900: '#0B0F19',
          950: '#07090E',
        },
        brand: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1', // Primary Indigo
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
          accent: '#06B6D4', // Tech Cyan
        },
        // Backwards compatibility mappings mapped to modern SaaS tech theme
        matrix: {
          primary: '#6366F1',
          dark: '#1E293B',
          bg: '#090D16',
          dim: '#334155',
          accent: '#06B6D4',
        },
        scifi: {
          bg: '#090D16',
          glass: 'rgba(15, 23, 42, 0.75)',
          accent: '#06B6D4',
          border: 'rgba(255, 255, 255, 0.08)',
        }
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'Courier New', 'monospace'],
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'saas-card': '0 0 0 1px rgba(255, 255, 255, 0.06), 0 4px 20px -2px rgba(0, 0, 0, 0.5)',
        'saas-glow': '0 0 25px -5px rgba(99, 102, 241, 0.25)',
        'saas-glow-cyan': '0 0 25px -5px rgba(6, 182, 212, 0.25)',
      },
      backgroundImage: {
        'tech-radial': 'radial-gradient(circle at 50% 0%, rgba(99, 102, 241, 0.15) 0%, transparent 65%)',
        'tech-grid': 'linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
      }
    },
  },
  plugins: [],
}
