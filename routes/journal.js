import express from 'express';
const router = express.Router();

router.post('/analyze', async (req, res) => {
  try {
    const { entry } = req.body;

    if (!entry) {
      return res.status(400).json({ error: 'Missing journal entry in request body.' });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://mymoodmuse.netlify.app',
        'X-Title': 'MoodMuse-AI',
      },
      body: JSON.stringify({
        model: 'mistral-7b-instruct',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful therapist assistant analyzing a user\'s journal entry and giving kind, thoughtful emotional feedback.',
          },
          {
            role: 'user',
            content: entry,
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(errorData);
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('❌ Error analyzing journal entry:', err.message);
    res.status(500).json({ error: 'Error analyzing journal entry.' });
  }
});

export default router;
