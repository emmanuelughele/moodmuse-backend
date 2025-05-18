import express from 'express';
import fetch from 'node-fetch';
const router = express.Router();

router.post('/analyze', async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Missing message in request body.' });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    const llmUrl = 'https://openrouter.ai/api/v1/chat/completions';

    // 🧠 Therapist system prompt
    const systemPrompt = `
You are an emotionally intelligent AI therapist with a tone that is gentle, curious, motherly, and sometimes funny-but-wise.
You build trust and speak in a warm, professional tone.
You ask thoughtful, open-ended questions that guide the user to reflect deeper.
You validate feelings and encourage vulnerability.
Always follow up with a short summary of the user’s emotional state (e.g., "You sound a bit overwhelmed") and one powerful, professional question.
Never rush or interrupt. Don’t try to fix—just understand.
At the end of your response, include a subtle emotion tag in this format: [#emotion:calm], [#emotion:anxious], [#emotion:hopeful], etc.
`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(history || []),
      { role: 'user', content: message },
    ];

    const response = await fetch(llmUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://mymoodmuse.netlify.app',
        'X-Title': 'MoodMuse-AI-Therapist',
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-medium',
        messages,
        max_tokens: 700,
        stream: false,
      }),
    });

    const data = await response.json();
    console.log('🧠 Therapist Chat:', JSON.stringify(data, null, 2));

    if (!response.ok || data.error) {
      return res.status(500).json({
        error: 'Failed to fetch from OpenRouter.',
        details: data.error?.message || 'Unknown error from LLM',
      });
    }

    const reply = data.choices?.[0]?.message?.content;

    // 📌 Optional: Extract the emotion tag if it exists
    const emotionMatch = reply.match(/\[#emotion:(.*?)\]/i);
    const emotion = emotionMatch ? emotionMatch[1] : null;
    const cleanReply = reply.replace(/\[#emotion:.*?\]/i, '').trim();

    res.status(200).json({ reply: cleanReply, emotion });

  } catch (err) {
    console.error('❌ Therapist chat error:', err.message);
    res.status(500).json({ error: 'Internal server error.', details: err.message });
  }
});

export default router;
