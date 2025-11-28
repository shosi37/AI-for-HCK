// src/components/EditProfileModal.jsx
import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { updateProfile } from 'firebase/auth'
import { auth } from '../firebase'
import GeneratedAvatarPicker from './GeneratedAvatarPicker'
import { FiX, FiCheck } from 'react-icons/fi'
import useTheme from '../hooks/useTheme'

function resolveTheme(hookTheme) {
  if (typeof window === 'undefined') return hookTheme || 'light'
  if (document.documentElement.classList.contains('dark')) return 'dark'
  if (hookTheme === 'dark' || hookTheme === 'light') return hookTheme
  try {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  } catch (e) {
    return 'light'
  }
}

export default function EditProfileModal({ open, setOpen, user }) {
  const [hookTheme] = useTheme()
  const resolvedTheme = resolveTheme(hookTheme)

  const [displayName, setDisplayName] = useState(user.displayName || '')
  const [photoURL, setPhotoURL] = useState(user.photoURL || '')
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (open) {
      setDisplayName(user.displayName || '')
      setPhotoURL(user.photoURL || '')
      setSaved(false)
    }
  }, [open, user])

  async function handleSave() {
    try {
      setBusy(true)
      await updateProfile(auth.currentUser, {
        displayName: displayName.trim() || null,
        photoURL: photoURL || null,
      })
      setSaved(true)
      setTimeout(() => setOpen(false), 800)
    } catch (err) {
      console.error(err)
      alert('Unable to update profile: ' + (err.message || err))
    } finally {
      setBusy(false)
    }
  }

  const modalBg = resolvedTheme === 'dark' ? 'bg-gray-900' : 'bg-white'
  const titleText = resolvedTheme === 'dark' ? 'text-gray-100' : 'text-gray-900'
  const labelText = resolvedTheme === 'dark' ? 'text-gray-300' : 'text-gray-700'
  const inputClasses = resolvedTheme === 'dark'
    ? 'w-full p-3 rounded-lg bg-gray-800 border border-gray-700 text-gray-100 focus-ring'
    : 'w-full p-3 rounded-lg bg-gray-50 border border-gray-200 text-gray-900 focus-ring'

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className={`w-full max-w-md rounded-2xl p-6 shadow-2xl ${modalBg}`} initial={{ scale: 0.98 }} animate={{ scale: 1 }} exit={{ scale: 0.98 }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold ${titleText}`}>Edit Profile</h3>
              <button onClick={() => setOpen(false)} className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 focus-ring" aria-label="Close">
                <FiX className={resolvedTheme === 'dark' ? 'text-gray-200' : 'text-gray-700'} />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`text-sm block mb-1 ${labelText}`}>Display name</label>
                <input value={displayName} onChange={e => setDisplayName(e.target.value)} className={inputClasses} placeholder="Your name" />
              </div>

              <div>
                <label className={`text-sm block mb-1 ${labelText}`}>Choose avatar (generated)</label>
                <GeneratedAvatarPicker name={displayName || user.email.split('@')[0]} currentUrl={photoURL} onSelect={(url) => setPhotoURL(url)} />
                {photoURL && <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">Selected avatar will be used as your profile photo.</div>}
              </div>

              <div className="flex items-center gap-3 mt-4">
                <button onClick={handleSave} disabled={busy} className="btn-primary px-5">
                  {busy ? 'Saving...' : saved ? (<><FiCheck className="inline" /> Saved</>) : 'Save'}
                </button>
                <button onClick={() => setOpen(false)} className={`px-4 py-2 rounded border ${resolvedTheme === 'dark' ? 'text-gray-200 border-gray-700' : 'text-gray-900 border-gray-200'}`}>Cancel</button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
