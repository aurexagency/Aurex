/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-black': 'var(--color-brand-black)',
        'brand-gold': 'var(--color-brand-gold)',
        'brand-marble': 'var(--color-brand-marble)',
        'brand-anthracite': 'var(--color-brand-anthracite)',
        'brand-gray': 'var(--color-brand-gray)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Playfair Display', 'serif'],
        serif: ['Playfair Display', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [],
}
