const express = require('express');
const fetch = require('node-fetch'); // Assuming you're using node-fetch for API requests
const cors = require('cors');
const dotenv = require('dotenv');
const journalRoutes = require('./routes/journal');

dotenv.config(); // This will load environment variables from .env file if needed

const app = express();
app.use(cors({ origin: 'https://mymoodmuse.netlify.app' }));
app.use(express.json());

// Define your base route BEFORE listen
app.get('/', (req, res) => {
  res.send('MoodMuse API is running.');
});

// Your route for journal-related actions
app.use('/api/journal', journalRoutes);

// API endpoint for generating LLaMA model responses
app.post('/api/generate', async (req, res) => {
    try {
        const entry = req.body.entry; // Assuming the body has a journal entry

        // Use the OPENROUTER_API_KEY environment variable
        const apiKey = process.env.OPENROUTER_API_KEY; // Access the API key securely
        if (!apiKey) {
            return res.status(500).json({ error: 'API key is missing.' });
        }

        // Example API call to OpenRouter (replace with the correct endpoint and method)
        const response = await fetch('https://api.openrouter.com/endpoint', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`, // Use the API key for authentication
            },
            body: JSON.stringify({ entry }),
        });

        const data = await response.json();
        res.json(data); // Return the response from the API

    } catch (error) {
        console.error('❌ Error:', error);
        res.status(500).json({ error: 'Failed to generate feedback from the model.' });
    }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
