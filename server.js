const express = require('express');
const app = express();
const path = require('path');
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));

app.get('/api/latest-games', (req, res) => {
  const start = parseInt(req.query.start || '0', 10);
  const games = Array.from({length: 10}, (_, i) => ({
    title: `Sample Game ${start + i + 1}`
  }));
  res.json(games);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
