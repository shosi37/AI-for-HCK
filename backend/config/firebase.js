require('dotenv').config();
const admin = require('firebase-admin');
const path = require('path');

const { SERVICE_ACCOUNT_PATH } = process.env;

if (!SERVICE_ACCOUNT_PATH) {
    throw new Error('SERVICE_ACCOUNT_PATH missing in environment variables');
}

try {
    // Resolve service account path.
    // We check if it's absolute, otherwise resolve relative to CWD (backend root)
    // or relative to this file? 'require' treats relative paths relative to the file.
    // But usually SERVICE_ACCOUNT_PATH in .env is something like "./service-account.json".
    // server.js was in root, so it worked. Here we are in config/.
    // Safe bet: resolve from process.cwd() which should be 'backend'.

    let serviceAccount;
    if (path.isAbsolute(SERVICE_ACCOUNT_PATH)) {
        serviceAccount = require(SERVICE_ACCOUNT_PATH);
    } else {
        serviceAccount = require(path.resolve(process.cwd(), SERVICE_ACCOUNT_PATH));
    }

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });

    console.log('🔥 Firebase Admin Initialized');
} catch (error) {
    console.error('Failed to initialize Firebase Admin:', error.message);
    throw error;
}

module.exports = admin;
