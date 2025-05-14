import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import journalRoutes from './routes/journal.js';

dotenv.config();

const app = express();

app.use(cors({
  origin: ['https://mymoodmuse.netlify.app', 'http://localhost:5173'],
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.send('MoodMuse API is running.');
});

// All journal-related routes go here
app.use('/api/journal', journalRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
