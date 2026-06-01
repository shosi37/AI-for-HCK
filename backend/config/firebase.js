/**
 * @fileoverview Firebase Admin SDK configuration and initialization.
 * Sets up the Firebase Admin instance using the service account credentials.
 */

require('dotenv').config();
const admin = require('firebase-admin');
const path = require('path');

const { SERVICE_ACCOUNT_PATH } = process.env;

// Ensure the service account path is provided
if (!SERVICE_ACCOUNT_PATH) {
    throw new Error('SERVICE_ACCOUNT_PATH missing in environment variables');
}

try {
    // Resolve service account path.
    // We check if it's absolute, otherwise resolve relative to CWD (backend root).
    // This allows .env to use paths like "./service-account.json" correctly.
    let serviceAccount;
    if (path.isAbsolute(SERVICE_ACCOUNT_PATH)) {
        serviceAccount = require(SERVICE_ACCOUNT_PATH);
    } else {
        serviceAccount = require(path.resolve(process.cwd(), SERVICE_ACCOUNT_PATH));
    }

    // Initialize Firebase Admin with the loaded credentials
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });

    console.log('Firebase Admin Initialized');
} catch (error) {
    console.error('Failed to initialize Firebase Admin:', error.message);
    throw error;
}

module.exports = admin;
