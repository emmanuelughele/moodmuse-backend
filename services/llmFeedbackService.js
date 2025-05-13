// services/llmFeedbackService.js
const axios = require('axios');

async function getLLMFeedbackStream(entry, onChunk) {
  if (!entry || entry.trim() === '') {
    throw new Error('Invalid journal entry');
  }

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
      url: process.env.LLM_API_URL || 'http://localhost:11434/api/generate',
      data: {
        model: 'llama3',
        prompt,
        stream: true
      },
      responseType: 'stream',
      timeout: 20000 // 20 seconds timeout to prevent hanging
    });

    return new Promise((resolve, reject) => {
      let fullText = '';

      response.data.on('data', (chunk) => {
        try {
          const lines = chunk.toString().split('\n').filter(Boolean);
          for (const line of lines) {
            const parsed = JSON.parse(line);
            if (parsed.response) {
              fullText += parsed.response;
              onChunk(parsed.response);
            }
          }
        } catch (err) {
          console.error('⚠️ Stream parsing error:', err.message);
        }
      });

      response.data.on('end', () => resolve(fullText));
      response.data.on('error', (err) => {
        console.error('❌ Stream error:', err.message);
        reject(new Error('Streaming failed from LLM'));
      });
    });

  } catch (error) {
    console.error('❌ LLM Feedback Error:', error.message);
    throw new Error('Failed to connect to the language model service.');
  }
}

module.exports = { getLLMFeedbackStream };
