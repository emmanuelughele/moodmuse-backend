// services/llmFeedbackService.js
const axios = require('axios');

async function getLLMFeedbackStream(entry, onChunk) {
  if (!entry || entry.trim() === '') {
    throw new Error('Invalid journal entry');
  }

  const messages = [
    {
      role: 'system',
      content: `You are an empathetic mental health assistant. Reflect on the user's journal entry in a supportive tone. Provide feedback and 1 follow-up question.`,
    },
    {
      role: 'user',
      content: entry,
    },
  ];

  try {
    const response = await axios({
      method: 'post',
      url: process.env.LLM_API_URL || 'https://openrouter.ai/api/v1/chat',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://mymoodmuse.netlify.app',
        'X-Title': 'MoodMuse',
      },
      data: {
        model: 'openchat/openchat-7b:free', // or try another free model
        messages: messages,
        stream: false, // You can use true and parse stream later
      },
      timeout: 20000,
    });

    const reply = response.data.choices[0].message.content;
    if (onChunk) onChunk(reply); // send all at once
    return reply;

  } catch (error) {
    console.error('❌ LLM Feedback Error:', error.message);
    throw new Error('Failed to connect to OpenRouter.');
  }
}

module.exports = { getLLMFeedbackStream };
