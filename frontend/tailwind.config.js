/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-white': '#ffffff',
        'brand-beige': '#f9f9eb',
        'brand-green': '#729855',
        'brand-gray-light': '#f5f5f5',
        'brand-charcoal': '#212b36',
        'brand-border': '#f7e9e3',
        'brand-muted': '#5a5a5a',
        'brand-button-hover': '#2f3e10',
        'brand-bg-cream': '#f7f6f0',
      },
      fontFamily: {
        heading: ["Outfit", "sans-serif"],
        body: ["Work Sans", "sans-serif"],
      },
      spacing: {
        'page': '164rem',
      }
    },
  },
  plugins: [],
}
