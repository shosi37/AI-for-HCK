// src/App.jsx
import React, { useEffect, useState } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth, saveUserToFirestore, getAdminCredentials, setAdminCredentials, setAdmins } from './firebase'
import AuthCard from './components/AuthCard'
import Home from './pages/Home'
import AnimatedBackground from './components/AnimatedBackground'

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u)
      setLoading(false)
      if (u) {
        // upsert basic user info for admin panel
        saveUserToFirestore(u)
      }
    })
    return () => unsub()
  }, [])

  // ensure default admin credentials exist (username: admin, password: admin)
  useEffect(() => {
    async function ensureDefault() {
      try {
        const creds = await getAdminCredentials()
        // set requested admin username/email and password if not present
        const desiredUsername = 'shoaibsid4884@gmail.com'
        const desiredPassword = 'admin00'
        if (!creds || creds.username !== desiredUsername || creds.hash === undefined) {
          const enc = new TextEncoder()
          const data = enc.encode(desiredPassword)
          const hashBuffer = await crypto.subtle.digest('SHA-256', data)
          const arr = Array.from(new Uint8Array(hashBuffer))
          const hex = arr.map(b => b.toString(16).padStart(2, '0')).join('')
          await setAdminCredentials({ username: desiredUsername, hash: hex })
        }
        // set the meta/admins document to contain only the single admin email
        try { await setAdmins({ emails: [desiredUsername], uids: [] }) } catch (e) { console.error('Failed to set default admins on startup', e) }
      } catch (e) {
        // ignore
      }
    }
    ensureDefault()
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <AnimatedBackground />
      <div className="z-10 w-full max-w-6xl px-6">
        <div className="mx-auto">
          {loading ? (
            <div className="p-10 text-center">Loading...</div>
          ) : user ? (
            <Home user={user} onSignOut={() => signOut(auth)} />
          ) : (
            <AuthCard />
          )}
        </div>
      </div>
    </div>
  )
}
