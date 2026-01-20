const express = require('express');
const router = express.Router();
const admin = require('../config/firebase');
const { transporter, EMAIL_USER, EMAIL_PASS } = require('../config/email');

/**
 * OTP: Send
 */
router.post('/send', async (req, res) => {
    const { email, uid } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

    try {
        const db = admin.firestore();
        await db.collection('otps').doc(email).set({
            otp,
            uid,
            expiresAt,
            createdAt: Date.now()
        });

        let mailSent = false;
        // Try sending email if credentials present
        if (!EMAIL_USER || !EMAIL_PASS) {
            console.log('--- DEVELOPMENT OTP (no email creds) ---');
            console.log(`Email: ${email}`);
            console.log(`OTP: ${otp}`);
            console.log('-----------------------------------------');
        } else {
            try {
                await transporter.sendMail({
                    from: `"AI Chatbot Support" <${EMAIL_USER}>`,
                    to: email,
                    subject: 'Your Verification Code',
                    text: `Your OTP is ${otp}. It will expire in 10 minutes.`,
                    html: `<b>Your OTP is ${otp}</b>. It will expire in 10 minutes.`
                });
                mailSent = true;
            } catch (sendErr) {
                console.error('SMTP send failed', sendErr && sendErr.message ? sendErr.message : sendErr);
                if (process.env.NODE_ENV !== 'production') {
                    // Log for dev even if send failed
                    console.log('--- DEVELOPMENT OTP (send failed) ---');
                    console.log(`OTP: ${otp}`);
                }
            }
        }

        const message = mailSent ? 'OTP sent successfully' : 'OTP generated; email could not be sent (check server logs)';
        res.json({ success: true, message });
    } catch (e) {
        console.error('OTP send failed', e);
        res.status(500).json({ error: 'Failed to create OTP' });
    }
});

/**
 * OTP: Verify
 */
router.post('/verify', async (req, res) => {
    const { email, otp, uid } = req.body;
    if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });

    try {
        const db = admin.firestore();
        const doc = await db.collection('otps').doc(email).get();

        if (!doc.exists) return res.status(400).json({ error: 'No OTP found for this email' });

        const data = doc.data();
        if (data.otp !== otp) return res.status(400).json({ error: 'Invalid OTP' });
        if (data.expiresAt < Date.now()) return res.status(400).json({ error: 'OTP expired' });

        // Mark user as verified in Firestore users collection
        await db.collection('users').doc(uid).set({ isVerified: true }, { merge: true });

        // Update all active sessions for this user to reflect verified status
        try {
            const sessionSnaps = await db.collection('sessions').where('uid', '==', uid).get();
            const batch = db.batch();
            sessionSnaps.docs.forEach(doc => {
                const meta = doc.data().meta || {};
                batch.update(doc.ref, { 'meta.isVerified': true });
            });
            await batch.commit();
        } catch (sessionErr) {
            console.warn('Failed to update sessions after OTP verification', sessionErr);
        }

        // Cleanup OTP
        await db.collection('otps').doc(email).delete();

        res.json({ success: true, message: 'Email verified successfully' });
    } catch (e) {
        console.error('OTP verify failed', e);
        res.status(500).json({ error: 'Verification failed' });
    }
});

module.exports = router;
