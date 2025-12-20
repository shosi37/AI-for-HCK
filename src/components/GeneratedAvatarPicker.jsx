// src/components/GeneratedAvatarPicker.jsx
import React, { useMemo, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import useTheme from '../hooks/useTheme'

/**
 * Robust GeneratedAvatarPicker using AbstractAPI avatar endpoint with preloading/fallback.
 * Respects app theme and provides a randomized seed grid; safe fallback image used when provider fails.
 *
 * Props:
 *  - name: string (seed base)
 *  - currentUrl: string (optional)
 *  - onSelect(url: string) => void
 */
export default function GeneratedAvatarPicker({ name = '', currentUrl = '', onSelect }) {
  const [theme] = useTheme()                // get current theme
  const [seedBase, setSeedBase] = useState((name && name.trim()) || `user`)
  const [variantIndex, setVariantIndex] = useState(0)
  const [loadingMap, setLoadingMap] = useState({}) // { url: 'loading'|'ok'|'error' }

  // simple variants array used for UI randomness (AbstractAPI ignores style param)
  const variants = ['v1','v2','v3','v4','v5','v6']

  // AbstractAPI key (preferred: set VITE_AVATAR_API_KEY in your .env; fallback to provided key)
  const AVATAR_API_KEY = import.meta.env.VITE_AVATAR_API_KEY || '30f2351721d942388fad70debe5eb231'

  // Build seeds
  const seeds = useMemo(() => {
    const base = seedBase || 'user'
    return Array.from({ length: 8 }).map((_, i) => `${base}-${variantIndex}-${i}`)
  }, [seedBase, variantIndex])

  // Build candidate AbstractAPI URLs for robustness
  // AbstractAPI avatar endpoint: https://avatars.abstractapi.com/v1/?api_key=KEY&name=...&size=120
  function avatarCandidates(seed /* style ignored for AbstractAPI */) {
    const s = encodeURIComponent(seed)
    const base = `https://avatars.abstractapi.com/v1/`
    const preferred = `${base}?api_key=${AVATAR_API_KEY}&name=${s}&size=120`
    const fallback = `${base}?api_key=${AVATAR_API_KEY}&name=${s}`
    return [preferred, fallback]
  }

  // Try each candidate in order and return the first working URL (or null)
  // Use Image() to detect load success to avoid CORS fetch issues.
  function findWorkingUrl(candidates) {
    return new Promise((resolve) => {
      let settled = false
      const tryNext = (i) => {
        if (i >= candidates.length) return resolve(null)
        const url = candidates[i]
        const img = new Image()
        img.onload = () => { if (!settled) { settled = true; resolve(url) } }
        img.onerror = () => { if (!settled) { tryNext(i + 1) } }
        // start load
        img.src = url
      }
      tryNext(0)
    })
  }

  // Preload whenever seeds, variant or theme change
  useEffect(() => {
    let active = true
    ;(async () => {
      for (const s of seeds) {
        // style is only UI-facing; AbstractAPI ignores style, so we pass the seed only
        const styleForSeed = variants[variantIndex % variants.length]
        const candidates = avatarCandidates(s)
        // key by seed so we never set the image src to a URL that failed
        setLoadingMap((m) => ({ ...m, [s]: { status: 'loading' } }))
        const working = await findWorkingUrl(candidates)
        if (!active) return
        if (working) setLoadingMap((m) => ({ ...m, [s]: { status: 'ok', url: working } }))
        else setLoadingMap((m) => ({ ...m, [s]: { status: 'error' } }))
      }
    })()
    return () => { active = false }
  }, [seeds, variantIndex, theme]) // re-run on theme change

  function handleRandomize() {
    setVariantIndex((v) => (v + 1) % variants.length)
    setSeedBase(`rnd-${Math.floor(Math.random() * 9999)}`)
  }

  // Fallback data URL (tiny inline SVG) for unreachable avatars
  function fallbackDataUrl(seed) {
    const initials = (seed || 'U').slice(0, 2).toUpperCase()
    const bg = theme === 'dark' ? '#111827' : '#ffffff'
    const fg = theme === 'dark' ? '#9ca3af' : '#6b7280'
    const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><rect width='100%' height='100%' fill='${bg}'/><text x='50%' y='50%' font-size='44' fill='${fg}' text-anchor='middle' dominant-baseline='central' font-family='Helvetica,Arial'>${initials}</text></svg>`
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
  }

  // which style is active for preview
  const style = variants[variantIndex % variants.length]

  return (
    <div>
      <div className="flex items-center gap-3 mb-3">
        <input
          value={seedBase}
          onChange={(e) => setSeedBase(e.target.value)}
          placeholder="Name or seed (optional)"
          className="w-full p-2 rounded border bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus-ring text-gray-900 dark:text-gray-100"
        />
        <button onClick={handleRandomize} className="px-3 py-2 rounded bg-indigo-600 text-white hover:opacity-95">
          Randomize
        </button>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {seeds.map((s) => {
          const entry = loadingMap[s] || { status: 'loading' }
          const status = entry.status
          const workingUrl = entry.url
          const isCurrent = currentUrl && currentUrl === workingUrl
          const showSrc = status === 'ok' && workingUrl ? workingUrl : fallbackDataUrl(s)

          return (
            <motion.button
              key={s}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect && onSelect(status === 'ok' && workingUrl ? workingUrl : fallbackDataUrl(s))}
              className={`relative rounded-lg overflow-hidden border p-1
                ${isCurrent ? 'border-indigo-400 ring-2 ring-indigo-400/30' : 'border-transparent'}
                ${theme === 'dark' ? 'bg-gray-900' : 'bg-white shadow-sm'}`}
            >
              <div className={`w-full h-20 flex items-center justify-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
                {status === 'loading' ? (
                  <div className="flex items-center justify-center">
                    <svg className="h-6 w-6 animate-spin text-gray-400" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                  </div>
                ) : (
                  <img
                    src={showSrc}
                    alt={`avatar-${s}`}
                    className="w-full h-20 object-cover block"
                    onError={(e) => { e.currentTarget.src = fallbackDataUrl(s) }}
                  />
                )}
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1 truncate px-1">{s.split('-').pop()}</div>
            </motion.button>
          )
        })}
      </div>

      <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
        Avatars generated by AbstractAPI. Tip: set <code>VITE_AVATAR_API_KEY</code> in your .env to use your own key.
      </div>
    </div>
  )
}
