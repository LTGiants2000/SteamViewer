// script.js
const grid = document.getElementById('game-container');

// Fetch list of games from SteamSpy
fetch('https://steamspy.com/api.php?request=all')
  .then(res => res.json())
  .then(allGames => {
    const sorted = Object.values(allGames)
      .filter(g => g.positive > 0 && g.owners !== '0 .. 0') // Filter out junk
      .sort((a, b) => b.release_date - a.release_date)
      .slice(0, 10); // Top 10 newest games

    sorted.forEach(game => fetchAndDisplayGame(game.appid, game.name));
  })
  .catch(err => {
    console.error("Failed to load game list:", err);
  });

function fetchAndDisplayGame(appId, gameName) {
  fetch(`/api/game/${appId}`)
    .then(res => res.json())
    .then(data => {
      if (!data[appId]?.success) return;
      const gameData = data[appId].data;

      const section = document.createElement('div');
      section.className = 'game-section';

      const title = document.createElement('h2');
      title.textContent = gameName;
      section.appendChild(title);

      const screenshots = gameData.screenshots;
      const scroller = document.createElement('div');
      scroller.className = 'scroll-row';

      screenshots.forEach(ss => {
        const img = document.createElement('img');
        img.src = ss.path_full;
        scroller.appendChild(img);
      });

      section.appendChild(scroller);
      grid.appendChild(section);
    })
    .catch(err => console.error(`Failed to load screenshots for ${gameName}`, err));
} 