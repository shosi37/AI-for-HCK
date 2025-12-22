// src/components/ThemeToggle.jsx
import React from 'react'
import { FiMoon, FiSun } from 'react-icons/fi'
import useTheme from '../../hooks/useTheme'

export default function ThemeToggle({ size = 18 }) {
  const [theme, setTheme] = useTheme()

  function toggle() {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <button
      onClick={toggle}
      aria-label="Toggle theme"
      title="Toggle theme"
      className="inline-flex items-center justify-center w-10 h-10 rounded-xl border 
                 bg-white/90 dark:bg-gray-800/60 text-gray-800 dark:text-gray-200
                 border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-colors duration-200 focus-ring"
    >
      {/* Show Moon icon in light mode, Sun in dark mode (so icon represents action) */}
      {theme === 'dark' ? <FiSun size={size} /> : <FiMoon size={size} />}
    </button>
  )
}
