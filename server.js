const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fetch = require('node-fetch'); // Import fetch to make API requests

dotenv.config();

const app = express();
app.use(cors({ origin: 'https://mymoodmuse.netlify.app' }));
app.use(express.json());

// Define your base route BEFORE listen
app.get('/', (req, res) => {
  res.send('MoodMuse API is running.');
});

// Your route for journal-related actions
app.post('/api/journal/analyze', async (req, res) => {
  try {
    const entry = req.body.entry; // The journal entry sent by the frontend

    // Send the journal entry to OpenRouter's Mistral 7B model
    const response = await fetch('https://api.openrouter.ai/v1/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`, // Use your OpenRouter API Key
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistral-7b-instruct', // Specify the Mistral 7B model
        prompt: entry, // Send the journal entry to the model
        max_tokens: 150, // You can adjust the number of tokens based on your needs
        temperature: 0.7, // Control the randomness of the response
      }),
    });

    const data = await response.json();

    if (response.ok) {
      // Return the feedback from the model
      res.json({
        feedback: data.choices[0].text || 'Empathetic feedback from Mistral 7B model',
      });
    } else {
      res.status(500).json({ error: 'Failed to generate feedback from the model.' });
    }
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: 'Failed to generate feedback from the model.' });
  }
});

// Your API endpoint for generating feedback (Optional)
app.post('/api/generate', async (req, res) => {
  try {
    const entry = req.body.entry;
    res.json({
      feedback: 'Empathetic feedback from LLaMA model',
      followUpQuestion: 'What made you feel this way?',
    });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: 'Failed to generate feedback from the model.' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
