// src/hooks/useTheme.js
import { useEffect, useState, useCallback } from 'react'

const STORAGE_KEY = 'theme' // 'dark' | 'light'

function getSystemPrefersDark() {
  try {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
  } catch (e) {
    return false
  }
}

function readStoredTheme() {
  try {
    const s = localStorage.getItem(STORAGE_KEY)
    if (s === 'dark' || s === 'light') return s
  } catch (e) {
    // ignore
  }
  return null
}

export default function useTheme() {
  // initial: read stored value -> fallback to system pref -> default 'light'
  const [theme, setThemeState] = useState(() => {
    const stored = readStoredTheme()
    if (stored) return stored
    return getSystemPrefersDark() ? 'dark' : 'light'
  })

  // apply/remove class and keep localStorage in sync
  const applyTheme = useCallback((t) => {
    try {
      const root = document.documentElement
      if (t === 'dark') {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
      localStorage.setItem(STORAGE_KEY, t)
    } catch (err) {
      // ignore
    }
  }, [])

  useEffect(() => {
    applyTheme(theme)
  }, [theme, applyTheme])

  // listen for changes in other tabs (storage event)
  useEffect(() => {
    function onStorage(e) {
      if (e.key !== STORAGE_KEY) return
      const newVal = e.newValue === 'dark' ? 'dark' : (e.newValue === 'light' ? 'light' : null)
      if (newVal && newVal !== theme) {
        setThemeState(newVal)
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [theme])

  // listen for system-level changes only if user hasn't explicitly set theme
  useEffect(() => {
    const stored = readStoredTheme()
    if (stored) return // user set a preference — don't auto-change with system
    try {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = (e) => {
        setThemeState(e.matches ? 'dark' : 'light')
      }
      mq.addEventListener ? mq.addEventListener('change', handler) : mq.addListener(handler)
      return () => {
        mq.removeEventListener ? mq.removeEventListener('change', handler) : mq.removeListener(handler)
      }
    } catch (err) {
      // ignore
    }
  }, [])

  // setter exposed to components
  const setTheme = useCallback((t) => {
    const final = t === 'dark' ? 'dark' : 'light'
    setThemeState(final)
    // applyTheme effect will persist to localStorage
  }, [])

  return [theme, setTheme]
}
