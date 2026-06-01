/**
 * @fileoverview Chatbot routing.
 * Proxies chat requests to the local Rasa server.
 */

const express = require('express');
const axios = require('axios');
const router = express.Router();

/**
 * Route: POST /chat
 * Forwards user messages to the Rasa chatbot webhook and returns the bot's responses.
 * Expects a body containing { sender: string, message: string }.
 * @route POST /chat
 * @returns {Object} JSON object containing an array of responses from Rasa.
 */
router.post('/chat', async (req, res) => {
	const { sender, message } = req.body;
	if (!sender || !message) {
		return res.status(400).json({ error: 'Missing sender or message' });
	}
	try {
		// Forward the incoming message to the Rasa webhook server running on port 5006
		const rasaRes = await axios.post('http://localhost:5006/webhooks/rest/webhook', {
			sender,
			message
		});
		// Rasa returns an array of response objects for the given message
		const responses = rasaRes.data;
		res.json({ responses });
	} catch (err) {
		console.error('Error communicating with Rasa:', err.message);
		res.status(502).json({ error: 'Failed to get response from Rasa' });
	}
});

module.exports = router;
