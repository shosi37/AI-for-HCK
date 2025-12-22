// src/components/SuccessPopup.jsx
import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiCheckCircle } from 'react-icons/fi'

export default function SuccessPopup({ message, onClose, ttl = 3500 }) {
  useEffect(() => {
    if (!message) return
    const t = setTimeout(() => onClose && onClose(), ttl)
    return () => clearTimeout(t)
  }, [message, ttl, onClose])

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.97 }}
          transition={{ duration: 0.25 }}
          className="
            fixed top-6 left-1/2 -translate-x-1/2 z-[100000]
            flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl
            bg-green-600 text-white ring-1 ring-green-800/30
          "
        >
          <FiCheckCircle className="text-xl" />
          <span className="font-medium text-sm">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
