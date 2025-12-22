// sessions.js — Firestore-backed sessions with file fallback
const fs = require('fs')
const path = require('path')
const { randomUUID } = require('crypto')
const admin = require('firebase-admin')

const DB = path.join(__dirname, 'sessions.json')
const COLLECTION = process.env.SESSIONS_COLLECTION || 'sessions'

function fileRead() {
  try {
    if (!fs.existsSync(DB)) return { sessions: [] }
    const raw = fs.readFileSync(DB, 'utf8')
    return JSON.parse(raw || '{"sessions": []}')
  } catch (e) {
    console.error('sessions file read error', e.message)
    return { sessions: [] }
  }
}

function fileWrite(data) {
  try {
    fs.writeFileSync(DB, JSON.stringify(data, null, 2))
    return true
  } catch (e) {
    console.error('sessions file write error', e.message)
    return false
  }
}

// Firestore helpers (require admin to be initialized)
function firestoreAvailable() {
  return !!(admin && admin.apps && admin.apps.length)
}

async function createSessionFirestore({ uid, tokenHash, expiresAt, meta = {} }) {
  const db = admin.firestore()
  const doc = db.collection(COLLECTION).doc()
  const s = { id: doc.id, uid, tokenHash, expiresAt, meta, createdAt: Date.now() }
  await doc.set(s)
  return s
}

async function findByTokenHashFirestore(tokenHash) {
  const db = admin.firestore()
  const q = await db.collection(COLLECTION).where('tokenHash', '==', tokenHash).limit(1).get()
  if (q.empty) return null
  const doc = q.docs[0]
  return doc.data()
}

async function deleteByTokenHashFirestore(tokenHash) {
  const db = admin.firestore()
  const q = await db.collection(COLLECTION).where('tokenHash', '==', tokenHash).get()
  if (q.empty) return false
  const batch = db.batch()
  q.docs.forEach(d => batch.delete(d.ref))
  await batch.commit()
  return true
}

async function rotateSessionFirestore(oldHash, newHash, newExpiresAt) {
  const db = admin.firestore()
  const q = await db.collection(COLLECTION).where('tokenHash', '==', oldHash).limit(1).get()
  if (q.empty) return null
  const doc = q.docs[0]
  await doc.ref.update({ tokenHash: newHash, expiresAt: newExpiresAt })
  const updated = await doc.ref.get()
  return updated.data()
}

// Public API: choose Firestore when available, else fallback to file
async function createSession(opts) {
  if (firestoreAvailable()) return createSessionFirestore(opts)
  return createSessionFile(opts)
}

async function findByTokenHash(tokenHash) {
  if (firestoreAvailable()) return findByTokenHashFirestore(tokenHash)
  return findByTokenHashFile(tokenHash)
}

async function deleteByTokenHash(tokenHash) {
  if (firestoreAvailable()) return deleteByTokenHashFirestore(tokenHash)
  return deleteByTokenHashFile(tokenHash)
}

async function rotateSession(oldHash, newHash, newExpiresAt) {
  if (firestoreAvailable()) return rotateSessionFirestore(oldHash, newHash, newExpiresAt)
  return rotateSessionFile(oldHash, newHash, newExpiresAt)
}

// File-based implementations (kept for local dev when admin not configured)
async function createSessionFile({ uid, tokenHash, expiresAt, meta = {} }) {
  const db = fileRead()
  const s = { id: randomUUID(), uid, tokenHash, expiresAt, meta, createdAt: Date.now() }
  db.sessions = db.sessions.filter(x => !(x.uid === uid && x.tokenHash === tokenHash))
  db.sessions.push(s)
  fileWrite(db)
  return s
}

async function findByTokenHashFile(tokenHash) {
  const db = fileRead()
  return db.sessions.find(s => s.tokenHash === tokenHash) || null
}

async function deleteByTokenHashFile(tokenHash) {
  const db = fileRead()
  const before = db.sessions.length
  db.sessions = db.sessions.filter(s => s.tokenHash !== tokenHash)
  fileWrite(db)
  return db.sessions.length !== before
}

async function rotateSessionFile(oldHash, newHash, newExpiresAt) {
  const db = fileRead()
  const idx = db.sessions.findIndex(s => s.tokenHash === oldHash)
  if (idx === -1) return null
  db.sessions[idx].tokenHash = newHash
  db.sessions[idx].expiresAt = newExpiresAt
  fileWrite(db)
  return db.sessions[idx]
}

// Migration helper: if Firestore is available and sessions.json exists, migrate entries
async function migrateFromFileDb() {
  if (!firestoreAvailable()) {
    console.warn('Firestore not initialized; skipping sessions migration')
    return { migrated: 0 }
  }

  if (!fs.existsSync(DB)) return { migrated: 0 }
  try {
    const raw = fileRead()
    const items = raw.sessions || []
    if (!items.length) return { migrated: 0 }

    const db = admin.firestore()
    const batch = db.batch()
    items.forEach(it => {
      const doc = db.collection(COLLECTION).doc()
      batch.set(doc, it)
    })
    await batch.commit()

    // backup and remove the local file
    fs.renameSync(DB, DB + '.bak.' + Date.now())
    console.log(`migrated ${items.length} sessions to Firestore and backed up ${DB}`)
    return { migrated: items.length }
  } catch (e) {
    console.error('migration error', e.message)
    return { migrated: 0, error: e.message }
  }
}

module.exports = { createSession, findByTokenHash, deleteByTokenHash, rotateSession, migrateFromFileDb }
