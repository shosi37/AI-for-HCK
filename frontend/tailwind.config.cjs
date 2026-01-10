const colors = require('tailwindcss/colors')

module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'selector',
  // Ensure some utility classes used via @apply are always available
  safelist: [
    'bg-gray-50',
    'text-gray-800',
    'bg-gray-900',
    'text-gray-100',
    'bg-transparent'
  ],
  theme: {
    extend: {
      colors: {
        // Map `gray` to Tailwind's `slate` palette so older `gray-*` usages work
        gray: colors.slate,
      },
    },
  },
  plugins: [],
}
