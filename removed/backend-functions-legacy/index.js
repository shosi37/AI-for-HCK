const functions = require('firebase-functions')

// Legacy functions moved here from /functions. They were minimal placeholders in the original project.
exports.noAdmin = functions.https.onRequest((req, res) => {
  res.status(200).send('Admin functions removed from this project - archived copy in backend/functions-legacy')
})