const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static(path.join(__dirname)));

// Proxy for SteamSpy API (bypasses CORS)
app.get('/api/steamspy', async (req, res) => {
  try {
    const response = await fetch('https://steamspy.com/api.php?request=all');
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch SteamSpy data' });
  }
});

// Proxy for individual Steam app details
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

// Serve index.html as default route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
