// src/components/BackButton.jsx
import React from 'react'
import { FiArrowLeft } from 'react-icons/fi'
import { motion } from 'framer-motion'

export default function BackButton({ onClick }) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus-ring"
      aria-label="Back"
    >
      <FiArrowLeft />
      <span>Back</span>
    </motion.button>
  )
}
