
const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname)));

// Debug endpoint
app.get('/api/test', (req, res) => {
  res.json({ status: 'Server is alive', timestamp: new Date().toISOString() });
});

// Log and return latest games
app.get('/api/latest-games', async (req, res) => {
  try {
    const response = await fetch('https://steamspy.com/api.php?request=all');
    const data = await response.json();

    const sorted = Object.values(data)
      .filter(game => game.positive > 0 && game.owners !== '0 .. 0')
      .sort((a, b) => b.release_date - a.release_date)
      .slice(parseInt(req.query.start || 0), parseInt(req.query.start || 0) + 20);

    console.log('Fetched games:', sorted.length);
    res.json(sorted.map(game => ({ appid: game.appid, title: game.name })));
  } catch (err) {
    console.error('Error in /api/latest-games:', err);
    res.status(500).json({ error: 'Failed to fetch games' });
  }
});

// Log and return game details
app.get('/api/game/:id', async (req, res) => {
  try {
    const response = await fetch(`https://store.steampowered.com/api/appdetails?appids=${req.params.id}`);
    const data = await response.json();
    console.log(`Fetched details for appid ${req.params.id}`);
    res.json(data);
  } catch (err) {
    console.error(`Error in /api/game/${req.params.id}:`, err);
    res.status(500).json({ error: 'Failed to fetch game details' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
