import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import journalRoutes from './routes/journal.js'; // Make sure the filename matches

dotenv.config();

const app = express();

app.use(cors({ origin: 'https://mymoodmuse.netlify.app' }));
app.use(express.json());

// Health check route
app.get('/', (req, res) => {
  res.send('MoodMuse API is running.');
});

// Mount journal routes
app.use('/api/journal', journalRoutes);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
