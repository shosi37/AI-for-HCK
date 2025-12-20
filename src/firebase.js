// src/firebase.js
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getFirestore, doc, setDoc, getDoc, collection, getDocs, updateDoc, addDoc, serverTimestamp, query, where, orderBy } from 'firebase/firestore'

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBZCprZtv9W51e_ZqAedZ6wTuBeuT6kdHw",
  authDomain: "ai-chatbot-for-hck.firebaseapp.com",
  projectId: "ai-chatbot-for-hck",
  storageBucket: "ai-chatbot-for-hck.appspot.com",   
  messagingSenderId: "469719977392",
  appId: "1:469719977392:web:79ba59366913f7281c9a75",
  measurementId: "G-QV0BXK046N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase Auth
export const auth = getAuth(app);

// Google login provider
export const googleProvider = new GoogleAuthProvider();

// Firebase Storage (for profile pictures)
export const storage = getStorage(app);

// Firestore
export const db = getFirestore(app);

// Helper to save basic user info to Firestore (upserts)
// sanitize dicebear URLs that may contain unsupported query params (e.g. backgroundType=gradient:1)
function sanitizeAvatarUrl(url) {
  try {
    const u = new URL(url)
    if (u.hostname.includes('dicebear')) {
      const bt = u.searchParams.get('backgroundType')
      if (bt && bt.startsWith('gradient')) u.searchParams.set('backgroundType', 'transparent')
      return u.toString()
    }
  } catch (e) {}
  return url
}

export async function saveUserToFirestore(user) {
  if (!user) return
  try {
    const ref = doc(db, 'users', user.uid)
    const sanitizedPhoto = user.photoURL ? sanitizeAvatarUrl(user.photoURL) : null
    await setDoc(ref, {
      uid: user.uid,
      email: user.email || null,
      displayName: user.displayName || null,
      photoURL: sanitizedPhoto,
      lastSeen: new Date().toISOString()
    }, { merge: true })
  } catch (e) {
    console.error('Failed to save user to Firestore', e)
  }
}

export async function getAdmins() {
  try {
    const ref = doc(db, 'meta', 'admins')
    const snap = await getDoc(ref)
    return snap.exists() ? snap.data() : { emails: [], uids: [] }
  } catch (e) {
    console.error('Failed to load admins', e)
    return { emails: [], uids: [] }
  }
}

export async function setChatbotConfig(config) {
  try {
    const ref = doc(db, 'config', 'chatbot')
    await setDoc(ref, config, { merge: true })
  } catch (e) {
    console.error('Failed to set chatbot config', e)
  }
}

export async function getChatbotConfig() {
  try {
    const ref = doc(db, 'config', 'chatbot')
    const snap = await getDoc(ref)
    return snap.exists() ? snap.data() : null
  } catch (e) {
    console.error('Failed to get chatbot config', e)
    return null
  }
}

export async function getAllUsers() {
  try {
    const col = collection(db, 'users')
    const snaps = await getDocs(col)
    return snaps.docs.map(d => ({ id: d.id, ...d.data() }))
  } catch (e) {
    console.error('Failed to fetch users', e)
    return []
  }
}

// Admin helpers: modify the meta/admins document
export async function addAdmin({ uid, email }) {
  try {
    const ref = doc(db, 'meta', 'admins')
    const snap = await getDoc(ref)
    const current = snap.exists() ? snap.data() : { emails: [], uids: [] }
    const emails = Array.from(new Set([...(current.emails || []), ...(email ? [email] : [])]))
    const uids = Array.from(new Set([...(current.uids || []), ...(uid ? [uid] : [])]))
    await setDoc(ref, { emails, uids }, { merge: true })
    return { emails, uids }
  } catch (e) {
    console.error('Failed to add admin', e)
    throw e
  }
}

// Overwrite admin list (use to ensure only one admin exists)
export async function setAdmins({ emails = [], uids = [] }) {
  try {
    const ref = doc(db, 'meta', 'admins')
    await setDoc(ref, { emails, uids })
  } catch (e) {
    console.error('Failed to set admins', e)
    throw e
  }
}

export async function removeAdmin({ uid, email }) {
  try {
    const ref = doc(db, 'meta', 'admins')
    const snap = await getDoc(ref)
    const current = snap.exists() ? snap.data() : { emails: [], uids: [] }
    const emails = (current.emails || []).filter(e => e !== email)
    const uids = (current.uids || []).filter(u => u !== uid)
    await setDoc(ref, { emails, uids }, { merge: true })
    return { emails, uids }
  } catch (e) {
    console.error('Failed to remove admin', e)
    throw e
  }
}

// Admin credentials (for simple username/password admin panel)
export async function getAdminCredentials() {
  try {
    const ref = doc(db, 'meta', 'adminCredentials')
    const snap = await getDoc(ref)
    return snap.exists() ? snap.data() : null
  } catch (e) {
    console.error('Failed to get admin credentials', e)
    return null
  }
}

export async function setAdminCredentials({ username, hash }) {
  try {
    const ref = doc(db, 'meta', 'adminCredentials')
    await setDoc(ref, { username, hash }, { merge: true })
  } catch (e) {
    console.error('Failed to set admin credentials', e)
    throw e
  }
}

// Ensure there's a default admin credentials doc (username: admin, password: admin)
export async function ensureDefaultAdminCredentials() {
  try {
    const ref = doc(db, 'meta', 'adminCredentials')
    const snap = await getDoc(ref)
    if (!snap.exists()) {
      // no doc exists — leave it to the app to create desired defaults
      return null
    }
    return snap.data()
  } catch (e) {
    console.error('Failed to ensure default admin credentials', e)
    return null
  }
}

// FAQ helpers for admin to manage chatbot FAQ
export async function getFAQ() {
  try {
    const ref = doc(db, 'config', 'faq')
    const snap = await getDoc(ref)
    return snap.exists() ? snap.data().items || [] : []
  } catch (e) {
    console.error('Failed to get FAQ', e)
    return []
  }
}

export async function setFAQ(items) {
  try {
    const ref = doc(db, 'config', 'faq')
    await setDoc(ref, { items }, { merge: true })
  } catch (e) {
    console.error('Failed to set FAQ', e)
    throw e
  }
}

// AI feedback helpers
export async function addAIFeedback({ uid, email, question, answer, accurate }) {
  try {
    const col = collection(db, 'aiFeedback')
    await addDoc(col, { uid: uid || null, email: email || null, question: question || null, answer: answer || null, accurate: !!accurate, createdAt: serverTimestamp() })
  } catch (e) {
    console.error('Failed to add AI feedback', e)
    throw e
  }
}

export async function getAIFeedbackStats({ days = 30 } = {}) {
  try {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    const col = collection(db, 'aiFeedback')
    const q = query(col, where('createdAt', '>=', since), orderBy('createdAt', 'asc'))
    const snaps = await getDocs(q)
    // group by day
    const map = {}
    snaps.docs.forEach(d => {
      const data = d.data()
      const dt = data.createdAt ? data.createdAt.toDate() : new Date()
      const key = dt.toISOString().slice(0,10)
      if (!map[key]) map[key] = { total: 0, accurate: 0 }
      map[key].total += 1
      if (data.accurate) map[key].accurate += 1
    })
    // build array for last N days
    const arr = []
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const key = date.toISOString().slice(0,10)
      const rec = map[key] || { total: 0, accurate: 0 }
      arr.push({ date: key, total: rec.total, accurate: rec.accurate, accuracy: rec.total ? rec.accurate / rec.total : 0 })
    }
    return arr
  } catch (e) {
    console.error('Failed to fetch AI feedback stats', e)
    return []
  }
}

// Per-FAQ accuracy breakdown: match feedback.question to FAQ items
export async function getAIFeedbackPerFAQ({ days = 30 } = {}) {
  try {
    const faqRef = doc(db, 'config', 'faq')
    const faqSnap = await getDoc(faqRef)
    const faqItems = faqSnap.exists() ? (faqSnap.data().items || []) : []

    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    const col = collection(db, 'aiFeedback')
    const q = query(col, where('createdAt', '>=', since), orderBy('createdAt', 'asc'))
    const snaps = await getDocs(q)

    const results = faqItems.map(f => ({ q: f.q || '', total: 0, accurate: 0 }))
    const other = { q: 'Other', total: 0, accurate: 0 }

    snaps.docs.forEach(d => {
      const data = d.data()
      const question = (data.question || '').toLowerCase()
      let matched = false
      for (const r of results) {
        const fq = (r.q || '').toLowerCase()
        if (!fq) continue
        if (question.includes(fq) || fq.includes(question) || question === fq) {
          r.total += 1
          if (data.accurate) r.accurate += 1
          matched = true
          break
        }
      }
      if (!matched) {
        other.total += 1
        if (data.accurate) other.accurate += 1
      }
    })

    // compute accuracy and filter items with zero counts if needed
    const out = results.map(r => ({ q: r.q, total: r.total, accurate: r.accurate, accuracy: r.total ? r.accurate / r.total : 0 }))
    out.push({ q: other.q, total: other.total, accurate: other.accurate, accuracy: other.total ? other.accurate / other.total : 0 })
    return out
  } catch (e) {
    console.error('Failed to fetch AI feedback per-FAQ', e)
    return []
  }
}
