/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        'josefin': ['var(--font-josefin-sans)', 'Josefin Sans', 'sans-serif'],
        'sans': ['var(--font-josefin-sans)', 'Josefin Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
