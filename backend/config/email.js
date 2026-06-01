/**
 * @fileoverview Email configuration and nodemailer setup for the backend.
 * Provides a configured nodemailer transporter for sending emails (e.g., OTPs).
 */

require('dotenv').config();
const nodemailer = require('nodemailer');

// Extract email credentials and service from environment variables
const EMAIL_USER = (process.env.EMAIL_USER || '').trim();
const EMAIL_PASS = (process.env.EMAIL_PASS || '').trim();
const EMAIL_SERVICE = process.env.EMAIL_SERVICE || 'gmail';

/**
 * Nodemailer transporter instance configured with the specified service and credentials.
 * @type {nodemailer.Transporter}
 */
const transporter = nodemailer.createTransport({
    service: EMAIL_SERVICE,
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
    },
});

// Verify connection configuration on startup
if (EMAIL_USER && EMAIL_PASS) {
    transporter.verify()
        .then(() => console.log('Email transporter verified'))
        .catch((err) => console.warn('Email transporter verification failed:', err && err.message));
} else {
    // Fallback message if credentials are missing
    console.log('EMAIL_USER or EMAIL_PASS not set —/api/otp/send will log to console');
}

module.exports = {
    transporter,
    EMAIL_USER,
    EMAIL_PASS
};
