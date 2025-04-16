const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files (like index.html, script.js, etc.)
app.use(express.static(path.join(__dirname)));

// API route to get game data from Steam
app.get('/api/game/:id', async (req, res) => {
  const appId = req.params.id;
  const url = `https://store.steampowered.com/api/appdetails?appids=${appId}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch Steam data.' });
  }
});

// Catch-all to serve index.html for root route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
