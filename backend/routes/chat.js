const express = require('express');
const router = express.Router();
const axios = require('axios');

const fs = require('fs');
const path = require('path');

router.post('/', async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Messages array is required' });
  }

  try {
    // Load knowledge base for NLU
    let knowledgeBase = "";
    try {
      const knowledgePath = path.join(__dirname, '../data/knowledge.json');
      if (fs.existsSync(knowledgePath)) {
        const rawData = fs.readFileSync(knowledgePath, 'utf8');
        knowledgeBase = `Use the following knowledge base to answer user queries: ${rawData}\n\n`;
      }
    } catch (kError) {
      console.error('Error loading knowledge base:', kError.message);
    }

    const lastUserMessage = messages[messages.length - 1]?.content || "Hello";
    const systemPrompt = `You are the HCK College AI Assistant, a strict query chatbot for Herald College Kathmandu (HCK). 

    --- GUIDELINES ---
    1. USE THE KNOWLEDGE BASE BELOW TO ANSWER ALL QUERIES.
    2. IF THE INFORMATION IS NOT IN THE KNOWLEDGE BASE, POLITELY STATE THAT YOU DO NOT HAVE THAT SPECIFIC INFORMATION AND ADVISE THE USER TO CONTACT THE COLLEGE DIRECTLY.
    3. DO NOT MAKE UP OR HALLUCINATE ANY FACTS, DATES, OR DETAILS.
    4. RESPOND IN A PROFESSIONAL, HELPFUL, AND CONCISE MANNER.

    --- KNOWLEDGE BASE ---
    ${knowledgeBase}

    USER QUERY: ${lastUserMessage}`;

    const prompt = `<|system|>\n${systemPrompt}</s>\n<|user|>\n${lastUserMessage}</s>\n<|assistant|>\n`;

    console.log('Calling Hugging Face API with NLP context');

    // Using the new router endpoint (OpenAI-compatible)
    const hfResponse = await axios.post(
      'https://router.huggingface.co/v1/chat/completions',
      {
        model: 'meta-llama/Llama-3.2-3B-Instruct',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: lastUserMessage }
        ],
        max_tokens: 300
      },
      { headers: { Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}` } }
    );

    console.log('Hugging Face API Success');

    const result = hfResponse.data;
    let content = "I couldn't generate a response right now.";

    if (result.choices && result.choices[0] && result.choices[0].message) {
      content = result.choices[0].message.content.trim();
    }

    res.json({ message: { role: 'assistant', content } });
  } catch (error) {
    console.error('Hugging Face API Error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to get response from Hugging Face AI',
      details: error.response?.data?.error || error.message
    });
  }
});

module.exports = router;
