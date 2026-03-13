/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: 'color-mix(in srgb, var(--color-primary) 10%, white)',
          100: 'color-mix(in srgb, var(--color-primary) 20%, white)',
          200: 'color-mix(in srgb, var(--color-primary) 40%, white)',
          300: 'color-mix(in srgb, var(--color-primary) 60%, white)',
          400: 'color-mix(in srgb, var(--color-primary) 80%, white)',
          500: 'var(--color-primary)',
          600: 'var(--color-primary)',
          700: 'color-mix(in srgb, var(--color-primary) 85%, black)',
          800: 'color-mix(in srgb, var(--color-primary) 70%, black)',
          900: 'color-mix(in srgb, var(--color-primary) 50%, black)',
        }
      },
      fontFamily: {
        'sans': ['var(--font-family)', 'ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'sans-serif'],
      }
    },
  },
  plugins: [],
}