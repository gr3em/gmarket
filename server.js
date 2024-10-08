const express = require('express');
const fetch = require('node-fetch');
const rateLimit = require("express-rate-limit");
const helmet = require('helmet');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(helmet());
app.use(cors());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});
app.use(limiter);

app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.get('/api/stock/:symbol', async (req, res) => {
  const { symbol } = req.params;
  const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;
  
  try {
    const response = await fetch(`https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${API_KEY}`);
    const data = await response.json();
    if (data['Error Message']) {
      return res.status(400).json({ error: data['Error Message'] });
    }
    res.json(data);
  } catch (error) {
    console.error('Error fetching stock data:', error);
    res.status(500).json({ error: 'Error fetching stock data' });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));