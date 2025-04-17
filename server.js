
const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname)));

app.get('/api/latest-games', async (req, res) => {
  try {
    const response = await fetch('https://steamspy.com/api.php?request=all');
    const data = await response.json();

    const sorted = Object.values(data)
      .filter(game => game.positive > 0 && game.owners !== '0 .. 0')
      .sort((a, b) => b.release_date - a.release_date)
      .slice(parseInt(req.query.start || 0), parseInt(req.query.start || 0) + 20);

    res.json(sorted.map(game => ({ appid: game.appid, title: game.name })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch games' });
  }
});

app.get('/api/game/:id', async (req, res) => {
  try {
    const response = await fetch(`https://store.steampowered.com/api/appdetails?appids=${req.params.id}`);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch game details' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
