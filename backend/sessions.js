const admin = require('firebase-admin')
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const COLLECTION = 'sessions'
const FILE_PATH = path.join(__dirname, 'sessions.json')

function ensureFile() {
  if (!fs.existsSync(FILE_PATH)) {
    fs.writeFileSync(FILE_PATH, JSON.stringify({ sessions: [] }, null, 2))
  }
}

function readFileStore() {
  ensureFile()
  const raw = fs.readFileSync(FILE_PATH, 'utf8')
  try {
    return JSON.parse(raw).sessions || []
  } catch (e) {
    console.warn('sessions.json parse failed, resetting file', e && e.message)
    fs.writeFileSync(FILE_PATH, JSON.stringify({ sessions: [] }, null, 2))
    return []
  }
}

function writeFileStore(sessions) {
  fs.writeFileSync(FILE_PATH, JSON.stringify({ sessions }, null, 2))
}

async function createSession({ uid, tokenHash, expiresAt, meta }) {
  // Prefer Firestore if available; fall back to file store on any error
  if (admin.apps.length) {
    try {
      const db = admin.firestore()
      const ref = db.collection(COLLECTION).doc()
      const session = {
        id: ref.id,
        uid,
        tokenHash,
        expiresAt,
        meta,
        createdAt: Date.now(),
      }
      await ref.set(session)
      return session
    } catch (e) {
      console.warn('createSession firestore failed, falling back to file store', e && e.message)
    }
  }

  // file store fallback
  const sessions = readFileStore()
  const id = crypto.randomUUID ? crypto.randomUUID() : crypto.randomBytes(16).toString('hex')
  const session = { id, uid, tokenHash, expiresAt, meta, createdAt: Date.now() }
  sessions.push(session)
  writeFileStore(sessions)
  return session
}

async function findByTokenHash(tokenHash) {
  if (admin.apps.length) {
    try {
      const db = admin.firestore()
      const q = await db
        .collection(COLLECTION)
        .where('tokenHash', '==', tokenHash)
        .limit(1)
        .get()

      if (q.empty) return null
      return q.docs[0].data()
    } catch (e) {
      console.warn('findByTokenHash firestore failed, falling back to file store', e && e.message)
    }
  }

  const sessions = readFileStore()
  return sessions.find(s => s.tokenHash === tokenHash) || null
}

async function rotateSession(oldHash, newHash, newExpiresAt) {
  if (admin.apps.length) {
    try {
      const db = admin.firestore()
      const q = await db
        .collection(COLLECTION)
        .where('tokenHash', '==', oldHash)
        .limit(1)
        .get()

      if (q.empty) return null

      const doc = q.docs[0]
      await doc.ref.update({ tokenHash: newHash, expiresAt: newExpiresAt })
      return true
    } catch (e) {
      console.warn('rotateSession firestore failed, falling back to file store', e && e.message)
    }
  }

  const sessions = readFileStore()
  const idx = sessions.findIndex(s => s.tokenHash === oldHash)
  if (idx === -1) return null
  sessions[idx].tokenHash = newHash
  sessions[idx].expiresAt = newExpiresAt
  writeFileStore(sessions)
  return true
}

async function deleteByTokenHash(tokenHash) {
  if (admin.apps.length) {
    try {
      const db = admin.firestore()
      const q = await db.collection(COLLECTION).where('tokenHash', '==', tokenHash).get()
      const batch = db.batch()
      q.docs.forEach(d => batch.delete(d.ref))
      await batch.commit()
      return
    } catch (e) {
      console.warn('deleteByTokenHash firestore failed, falling back to file store', e && e.message)
    }
  }

  const sessions = readFileStore()
  const filtered = sessions.filter(s => s.tokenHash !== tokenHash)
  writeFileStore(filtered)
}

async function migrateFromFileDb() {
  // Attempt to move local sessions into firestore (used on startup)
  if (!admin.apps.length) return { migrated: 0 }
  const sessions = readFileStore()
  if (!sessions || !sessions.length) return { migrated: 0 }

  try {
    const db = admin.firestore()
    let migrated = 0
    for (const s of sessions) {
      // write each session into firestore with same id
      const ref = db.collection(COLLECTION).doc(s.id)
      await ref.set(s)
      migrated++
    }

    // clear local store after successful migration
    writeFileStore([])
    return { migrated }
  } catch (e) {
    console.warn('migrateFromFileDb failed', e && e.message)
    return { migrated: 0 }
  }
}

module.exports = {
  createSession,
  findByTokenHash,
  rotateSession,
  deleteByTokenHash,
  migrateFromFileDb,
}
