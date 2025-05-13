const axios = require('axios');

async function getLLMFeedbackStream(entry, onChunk) {
  if (!entry || entry.trim() === '') {
    throw new Error('Invalid journal entry');
  }

  // Construct the prompt
  const prompt = `
You are an empathetic mental health assistant. A user just wrote this journal entry:

"${entry}"

1. Gently reflect on their emotional state and offer thoughtful, human-like feedback.
2. Suggest 1 follow-up question they can reflect on.
3. Keep the tone warm and supportive.
4. Format your reply like:

Feedback: <your feedback>

Follow-up Question: <a thoughtful question>
`;

  try {
    const response = await axios({
      method: 'post',
      url: process.env.LLM_API_URL || 'https://openrouter.ai/api/v1/chat',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://mymoodmuse.netlify.app', // Optional but helpful for OpenRouter tracking
      },
      data: {
        model: 'mistral/mistral-7b-instruct',
        messages: [
          { role: 'system', content: 'You are an empathetic mental health assistant.' },
          { role: 'user', content: prompt }
        ],
        stream: true
      },
      responseType: 'stream',
      timeout: 20000
    });

    return new Promise((resolve, reject) => {
      let fullText = '';

      response.data.on('data', (chunk) => {
        const lines = chunk.toString().split('\n').filter(line => line.trim() !== '');
        for (const line of lines) {
          if (line.startsWith('data:')) {
            const jsonStr = line.replace(/^data:\s*/, '');
            if (jsonStr === '[DONE]') continue;

            try {
              const parsed = JSON.parse(jsonStr);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                fullText += content;
                onChunk(content); // Stream to frontend
              }
            } catch (err) {
              console.error('⚠️ Stream JSON parse error:', err.message);
            }
          }
        }
      });

      response.data.on('end', () => resolve(fullText));
      response.data.on('error', (err) => {
        console.error('❌ Stream error:', err.message);
        reject(new Error('Streaming failed from OpenRouter'));
      });
    });

  } catch (error) {
    console.error('❌ LLM Feedback Error:', error.message);
    throw new Error('Failed to connect to OpenRouter.');
  }
}

module.exports = { getLLMFeedbackStream };
