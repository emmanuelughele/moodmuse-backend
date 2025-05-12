// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const journalRoutes = require('./routes/journal');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/journal', journalRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
