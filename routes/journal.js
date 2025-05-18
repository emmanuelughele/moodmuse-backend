import express from 'express';
import fetch from 'node-fetch';
const router = express.Router();


router.post('/analyze', async (req, res) => {
  try {
    const { entry } = req.body;

    if (!entry) {
      return res.status(400).json({ error: 'Missing journal entry in request body.' });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    const llmUrl = 'https://openrouter.ai/api/v1/chat/completions';

    const response = await fetch(llmUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://mymoodmuse.netlify.app',
        'X-Title': 'MoodMuse-AI',
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-medium', // ✅ use the correct model name
        messages: [
          {
            role: 'system',
            content: 'You are an empathetic mental health assistant analyzing a user\'s journal entry and giving kind, thoughtful emotional feedback.',
          },
          {
            role: 'user',
            content: entry,
          },
        ],
        max_tokens: 500, // ✅ Add this to avoid over-budget issues
        stream: false,
      }),
    });

    const data = await response.json();
console.log('📦 OpenRouter response:', JSON.stringify(data, null, 2));


    if (!response.ok || data.error) {
      return res.status(500).json({
        error: 'Failed to fetch from OpenRouter.',
        details: data.error?.message || 'Unknown error from LLM',
      });
    }

    const feedback = data.choices?.[0]?.message?.content;
res.status(200).json({ feedback }); // ✅ This is what frontend expects

  } catch (err) {
    console.error('❌ Server error analyzing journal entry:', err.message);
    res.status(500).json({ error: 'Internal server error.', details: err.message });
  }
});

export default router;
