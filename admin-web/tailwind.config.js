/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cu: {
          navy: '#0B192C',
          blue: '#1E3E62',
          accent: '#0066FF',
          gold: '#F59E0B',
          emerald: '#10B981',
          danger: '#EF4444',
          slate: '#F8FAFC',
        }
      }
    },
  },
  plugins: [],
}
