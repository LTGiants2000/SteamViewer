const express = require('express');
const fetch = require('node-fetch');
const cheerio = require('cheerio');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname)));

// Scrape Steam search page for latest games
app.get('/api/latest-games', async (req, res) => {
  try {
    const response = await fetch('https://store.steampowered.com/search/?sort_by=Released_DESC&untags=12095&category1=998&os=win&supportedlang=english&ndl=1');
    const html = await response.text();
    const $ = cheerio.load(html);
    const games = [];

    $('.search_result_row').each((i, elem) => {
      const title = $(elem).find('.title').text().trim();
      const href = $(elem).attr('href');
      const match = href.match(/\/app\/(\d+)/);
      if (title && match) {
        games.push({ appid: match[1], title });
      }
    });

    res.json(games.slice(0, 20)); // limit to top 20
  } catch (err) {
    res.status(500).json({ error: 'Failed to scrape Steam search page' });
  }
});

app.get('/api/game/:id', async (req, res) => {
  const appId = req.params.id;
  const url = `https://store.steampowered.com/api/appdetails?appids=${appId}`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch game details' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
