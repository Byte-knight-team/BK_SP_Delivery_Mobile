/** @type {import('tailwindcss').Config} */
module.exports = {
  // NativeWind requires these paths to scan for class usage
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  // NativeWind v4 preset — required
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // CraveHouse brand orange palette — matches the web frontend
        brand: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316', // Primary brand color
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
      },
      fontFamily: {
        sans: ['Inter', 'System'],
      },
    },
  },
  plugins: [],
}
