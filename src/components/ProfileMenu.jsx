// src/components/ProfileMenu.jsx
import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiChevronDown, FiLogOut, FiEdit } from 'react-icons/fi'
import EditProfileModal from './EditProfileModal'
import EditEmailModal from './EditEmailModal'

export default function ProfileMenu({ user, onSignOut }) {
  const [open, setOpen] = useState(false)
  const [editProfileOpen, setEditProfileOpen] = useState(false)
  const [editEmailOpen, setEditEmailOpen] = useState(false)

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="inline-flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition focus-ring"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600 overflow-hidden flex items-center justify-center">
          {user.photoURL ? (
            <img src={user.photoURL} alt="avatar" className="w-full h-full object-cover" />
          ) : (
            <span className="text-lg text-gray-700 dark:text-gray-100">{user.displayName ? user.displayName[0].toUpperCase() : user.email[0].toUpperCase()}</span>
          )}
        </div>

        <div className="text-left">
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.displayName || 'User'}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400 break-all">{user.email}</div>
        </div>

        <FiChevronDown className="text-gray-600 dark:text-gray-300" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="absolute right-0 mt-3 w-56 bg-white/95 dark:bg-gray-900/80 backdrop-blur-md rounded-xl shadow-lg z-50 overflow-hidden"
          >
            <div className="p-2">
              <button
                onClick={() => { setEditProfileOpen(true); setOpen(false) }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-50 dark:hover:bg-white/5 text-gray-800 dark:text-gray-100"
              >
                <FiEdit /> Edit Profile
              </button>

              <button
                onClick={() => { setEditEmailOpen(true); setOpen(false) }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-50 dark:hover:bg-white/5 text-gray-800 dark:text-gray-100"
              >
                <FiEdit /> Edit Email / Password
              </button>

              <div className="my-1 border-t border-gray-200/30 dark:border-white/5"></div>

              <button
                onClick={() => { onSignOut(); setOpen(false) }}
                className="w-full flex items-center gap-2 px-3 py-2 rounded text-rose-500 hover:bg-gray-50 dark:hover:bg-white/5"
              >
                <FiLogOut /> Sign out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modals */}
      <EditProfileModal open={editProfileOpen} setOpen={setEditProfileOpen} user={user} />
      <EditEmailModal open={editEmailOpen} setOpen={setEditEmailOpen} user={user} />
    </div>
  )
}
