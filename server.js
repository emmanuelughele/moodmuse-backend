const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const journalRoutes = require('./routes/journal');

dotenv.config();

const app = express();
app.use(cors({ origin: 'https://mymoodmuse.netlify.app' }));
app.use(express.json());

// Define your base route BEFORE listen
app.get('/', (req, res) => {
  res.send('MoodMuse API is running.');
});

// Your route for journal-related actions
app.use('/api/journal', journalRoutes);

// Your API endpoint for generating LLaMA model responses
app.post('/api/generate', async (req, res) => {
    try {
        // Implement the logic to generate feedback from the LLaMA model
        const entry = req.body.entry; // Assuming the body has a journal entry
        // Call the LLaMA model here and return a response
        res.json({
            feedback: 'Empathetic feedback from LLaMA model',
            followUpQuestion: 'What made you feel this way?'
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
