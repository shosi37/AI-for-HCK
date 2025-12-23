import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiChevronDown, FiLogOut, FiEdit } from 'react-icons/fi'
import EditProfileModal from './EditProfileModal'
import EditEmailModal from './EditEmailModal'

export default function ProfileMenu({ user, onSignOut }) {
  const [open, setOpen] = useState(false)
  const [editProfileOpen, setEditProfileOpen] = useState(false)
  const [editEmailOpen, setEditEmailOpen] = useState(false)

  function sanitizeAvatarUrl(url) {
    try {
      // Allow data URLs and blob URLs (e.g., generated SVGs)
      if (typeof url === 'string' && (url.startsWith('data:') || url.startsWith('blob:'))) return url
      const u = new URL(url)
      const host = u.hostname
      if (host.includes('dicebear')) {
        const bt = u.searchParams.get('backgroundType') || u.searchParams.get('background')
        if (bt && bt.startsWith('gradient')) {
          if (u.searchParams.has('backgroundType')) u.searchParams.set('backgroundType', 'transparent')
          else u.searchParams.set('background', 'transparent')
        }
        return u.toString()
      }
      if (host.includes('abstractapi') || host.includes('liara.run') || host.includes('iran.liara.run') || host.includes('avatar.iran.liara.run')) {
        return u.toString()
      }
    } catch (e) {}
    return url
  }

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
            <img
              src={(() => {
                try {
                  const url = sanitizeAvatarUrl(user.photoURL)
                  // If the URL is an AbstractAPI URL (or the app's proxy), prefer the backend proxy to avoid Referer/CORS blocking
                  if (typeof url === 'string' && (url.includes('abstractapi.com') || url.includes('/api/avatar/abstract') || url.includes('avatars.abstractapi.com'))) {
                    const uid = (user && user.uid) || (url.split('/').pop && url.split('/').pop().replace('.svg','').replace('.png',''))
                    // prefer explicit env var, otherwise default to dev backend on localhost:4000
                    const base = import.meta.env.VITE_BACKEND_URL || (import.meta.env.MODE !== 'production' ? `${location.protocol}//${location.hostname}:4000` : '')
                    return `${base}/api/avatar/abstract/${encodeURIComponent(uid)}`
                  }
                  return url
                } catch (e) { return user.photoURL }
              })()}
              alt="avatar"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {
                try {
                  // Clear any existing onerror to avoid loops
                  e.currentTarget.onerror = null

                  // If we failed to load the backend proxy, try the direct AbstractAPI URL (or a UI-Avatars fallback)
                  const cur = e.currentTarget.src || ''

                  // small retry state to avoid infinite loops
                  const tries = parseInt(e.currentTarget.getAttribute('data-avatar-tries') || '0', 10)
                  if (tries < 2) {
                    e.currentTarget.setAttribute('data-avatar-tries', String(tries + 1))
                    try {
                      // attempt to toggle between proxy and direct URL
                      const uidFromUser = (user && user.photoURL && user.photoURL.includes('/api/avatar/abstract')) ? user.photoURL.split('/api/avatar/abstract/').pop().replace('.svg','').replace('.png','') : null
                      const uidFromSrc = cur.includes('/api/avatar/abstract/') ? cur.split('/api/avatar/abstract/').pop().replace('.svg','').replace('.png','') : null
                      const uid = uidFromUser || uidFromSrc || (user && user.uid) || null
                      if (uid) {
                        const base = import.meta.env.VITE_BACKEND_URL || (import.meta.env.MODE !== 'production' ? `${location.protocol}//${location.hostname}:4000` : '')
                        const proxy = `${base}/api/avatar/abstract/${encodeURIComponent(uid)}`
                        const key = import.meta.env.VITE_AVATAR_API_KEY || null
                        const direct = key ? `https://avatars.abstractapi.com/v1/?api_key=${encodeURIComponent(key)}&name=${encodeURIComponent(uid)}` : `https://ui-avatars.com/api/?name=${encodeURIComponent(uid)}&format=png`
                        // If current is proxy, try direct; otherwise try proxy
                        if (cur.includes('/api/avatar/abstract/')) {
                          e.currentTarget.src = direct
                          return
                        } else {
                          e.currentTarget.src = proxy
                          return
                        }
                      }
                    } catch (swapErr) {
                      // fall through to initials
                    }
                  }

                  // Fallback to initials SVG
                  const initials = (user.displayName ? user.displayName[0] : (user.email ? user.email[0] : 'U')).toUpperCase()
                  const bg = document.documentElement.classList.contains('dark') ? '#111827' : '#ffffff'
                  const fg = document.documentElement.classList.contains('dark') ? '#9ca3af' : '#6b7280'
                  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><rect width='100%' height='100%' fill='${bg}'/><text x='50%' y='50%' font-size='44' fill='${fg}' text-anchor='middle' dominant-baseline='central' font-family='Helvetica,Arial'>${initials}</text></svg>`
                  e.currentTarget.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(svg)
                } catch (err) { e.currentTarget.style.display = 'none' }
              }}
            />
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
            className="absolute right-0 mt-3 w-56 bg-white/95 dark:bg-gray-900/80 backdrop-blur-md rounded-xl shadow-lg z-50 overflow-hidden transition-colors duration-200"
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

      <EditProfileModal open={editProfileOpen} setOpen={setEditProfileOpen} user={user} />
      <EditEmailModal open={editEmailOpen} setOpen={setEditEmailOpen} user={user} />
    </div>
  )
}
