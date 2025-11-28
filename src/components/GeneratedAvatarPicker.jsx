// src/components/GeneratedAvatarPicker.jsx
import React, { useMemo, useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import useTheme from '../hooks/useTheme'

/**
 * Robust GeneratedAvatarPicker using DiceBear SVG endpoint with preloading/fallback.
 * Now respects app theme: transparent/clean avatars for light mode; gradient for dark.
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

  // Supported dicebear styles (pick a few stable ones)
  const variants = ['initials', 'pixel-art', 'adventurer', 'avataaars', 'identicon', 'big-smile']

  // Build seeds
  const seeds = useMemo(() => {
    const base = seedBase || 'user'
    return Array.from({ length: 8 }).map((_, i) => `${base}-${variantIndex}-${i}`)
  }, [seedBase, variantIndex])

  // Build a stable, encoded dicebear SVG URL
  function avatarUrlFor(seed, style = 'initials') {
    const s = encodeURIComponent(seed)

    // Choose background type based on theme:
    // - light theme: transparent (so the avatar sits on a light tile)
    // - dark theme: gradient (nice contrast for dark UI)
    const bgType = theme === 'dark' ? 'gradient' : 'transparent'

    // Use the avatars.dicebear.com API which is broadly compatible
    // Example: https://avatars.dicebear.com/api/initials/seed.svg?backgroundType=transparent
    return `https://avatars.dicebear.com/api/${style}/${s}.svg?backgroundType=${bgType}`
  }

  // Preload helper that checks HTTP response before marking ok
  async function preloadUrl(url) {
    try {
      // lightweight HEAD/GET check
      const res = await fetch(url, { method: 'GET', cache: 'force-cache' })
      if (!res.ok) throw new Error('not-ok')
      return true
    } catch (err) {
      return false
    }
  }

  // Preload whenever seeds, variant or theme change
  useEffect(() => {
    let active = true
    ;(async () => {
      for (const s of seeds) {
        const url = avatarUrlFor(s, variants[variantIndex % variants.length])
        setLoadingMap((m) => ({ ...m, [url]: 'loading' }))
        const ok = await preloadUrl(url)
        if (!active) return
        setLoadingMap((m) => ({ ...m, [url]: ok ? 'ok' : 'error' }))
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
          const url = avatarUrlFor(s, style)
          const status = loadingMap[url] || 'loading'
          const isCurrent = currentUrl && currentUrl === url
          const showSrc = status === 'ok' ? url : fallbackDataUrl(s)

          return (
            <motion.button
              key={s}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelect && onSelect(url)}
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
        Avatars generated by DiceBear. Use Randomize or change the seed to get more variants.
      </div>
    </div>
  )
}
