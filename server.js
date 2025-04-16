const express = require('express');
const fetch = require('node-fetch');
const app = express();
const PORT = 3000;

app.use(express.static('public')); // your HTML/CSS/JS lives in 'public'

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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
