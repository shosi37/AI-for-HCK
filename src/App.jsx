// src/App.jsx
import React, { useEffect, useState } from 'react'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { auth } from './firebase'
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
    })
    return () => unsub()
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
