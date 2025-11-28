// src/components/ErrorPopup.jsx
import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiAlertTriangle } from 'react-icons/fi'

export default function ErrorPopup({ message }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.25 }}
          className="
            fixed top-6 left-1/2 -translate-x-1/2 
            bg-red-500 text-white px-5 py-3 rounded-xl shadow-xl 
            flex items-center gap-3 z-50
          "
        >
          <FiAlertTriangle className="text-xl" />
          <span className="font-medium">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
