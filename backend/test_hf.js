require('dotenv').config({ path: './.env' });
const axios = require('axios');

async function testHF() {
    const key = process.env.HUGGINGFACE_API_KEY;
    console.log('Testing with Key:', key ? (key.substring(0, 10) + '...') : 'MISSING');

    try {
        const response = await axios.post(
            'https://router.huggingface.co/v1/chat/completions',
            {
                model: 'meta-llama/Llama-3.2-3B-Instruct',
                messages: [{ role: 'user', content: 'Hello' }],
                max_tokens: 100
            },
            { headers: { Authorization: `Bearer ${key}` } }
        );
        console.log('Success!', response.data);
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
}

testHF();
