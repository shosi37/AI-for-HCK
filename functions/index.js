const functions = require('firebase-functions')

// Admin functionality removed — no Cloud Functions requiring firebase-admin are included.
// Keep a small placeholder function to avoid deployment errors if functions folder is used.
exports.noAdmin = functions.https.onRequest((req, res) => {
  res.status(200).send('Admin functions removed from this project')
})