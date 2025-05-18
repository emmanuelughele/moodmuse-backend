import axios from 'axios';

/**
 * Streams LLM feedback from OpenRouter in Therapy Mode
 * @param {string} entry - User's journal entry
 * @param {function} onChunk - Callback for handling streamed chunks
 */
export async function getLLMFeedbackStream(entry, onChunk) {
  if (!entry || entry.trim() === '') {
    throw new Error('Invalid journal entry');
  }

  const prompt = `
You are a licensed therapist in a secure and private therapeutic setting. 
A client has just shared the following journal entry:

"${entry}"

Please do the following:
1. Use reflective listening to validate their emotional experience.
2. Provide a brief therapeutic insight using principles from CBT, ACT, or person-centered therapy.
3. Ask one gentle, introspective question to guide their self-awareness or emotional growth.
4. Use warm, compassionate, professional language — not overly casual or robotic.
5. Keep your tone calm, reassuring, and grounded.

Format your response like this:

Feedback: <your feedback>

Therapist's Question: <your question>
`;

  try {
    const response = await axios({
      method: 'post',
      url: process.env.LLM_API_URL || 'https://openrouter.ai/api/v1/chat/completions',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://mymoodmuse.netlify.app',
        'X-Title': 'MoodMuse-AI',
      },
      data: {
        model: 'mistral/mistral-7b-instruct',
        messages: [
          {
            role: 'system',
            content: `You are a compassionate, professional therapist. Keep responses warm, insightful, and trauma-informed.`,
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        stream: true,
      },
      responseType: 'stream',
      timeout: 20000,
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
                onChunk(content);
              }
            } catch (err) {
              console.error('⚠️ Stream JSON parse error:', err.message);
            }
          }
        }
      });

      response.data.on('end', () => {
        resolve(fullText);
      });

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
