// src/App.jsx
import React, { useEffect, useState } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth, saveUserToFirestore } from './firebase' 
import AuthCard from './components/auth/AuthCard'
import Home from './pages/Home'
import AnimatedBackground from './components/AnimatedBackground'
import { ErrorBoundary } from './components/error' 

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let unsub = null
    const token = localStorage.getItem('auth-token')

    if (token) {
      ;(async () => {
        try {
          const base = import.meta.env.VITE_BACKEND_URL || ''
          const r = await fetch(`${base}/api/profile`, { headers: { Authorization: `Bearer ${token}` } })
          if (r.ok) {
            const { user } = await r.json()
            setUser(user)
          } else {
            unsub = onAuthStateChanged(auth, (u) => {
              setUser(u)
              if (u) saveUserToFirestore(u)
            })
          }
        } catch (e) {
          unsub = onAuthStateChanged(auth, (u) => {
            setUser(u)
            if (u) saveUserToFirestore(u)
          })
        } finally {
          setLoading(false)
        }
      })()
    } else {
      unsub = onAuthStateChanged(auth, (u) => {
        setUser(u)
        setLoading(false)
        if (u) saveUserToFirestore(u)
      })
    }

    return () => { if (unsub) unsub() }
  }, [])

  function handleSignOut() {
    try { localStorage.removeItem('auth-token') } catch (e) {}
    signOut(auth)
    setUser(null)
  }



  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <AnimatedBackground />
      <div className="z-10 w-full max-w-6xl px-6">
        <div className="mx-auto">
          <ErrorBoundary>
            {loading ? (
              <div className="p-10 text-center">Loading...</div>
            ) : user ? (
              <Home user={user} onSignOut={handleSignOut} />
            ) : (
              <AuthCard />
            )}
          </ErrorBoundary>
        </div>
      </div>
    </div>
  )
}
