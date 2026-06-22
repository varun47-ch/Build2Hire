/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0066cc',
        secondary: '#f0f4f8',
        success: '#10b981',
        error: '#ef4444'
      }
    }
  },
  plugins: []
} 