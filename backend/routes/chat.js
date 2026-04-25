const express = require('express');
const axios = require('axios');
const router = express.Router();

// POST /api/chat
// Body: { sender: string, message: string }
router.post('/chat', async (req, res) => {
	const { sender, message } = req.body;
	if (!sender || !message) {
		return res.status(400).json({ error: 'Missing sender or message' });
	}
	try {
		// Forward message to Rasa server
		const rasaRes = await axios.post('http://localhost:5005/webhooks/rest/webhook', {
			sender,
			message
		});
		// Rasa returns an array of responses
		const responses = rasaRes.data;
		res.json({ responses });
	} catch (err) {
		console.error('Error communicating with Rasa:', err.message);
		res.status(502).json({ error: 'Failed to get response from Rasa' });
	}
});

module.exports = router;
