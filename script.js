const grid = document.getElementById('game-container');
let startIndex = 0;
let loading = false;
const pageSize = 20;

window.addEventListener('scroll', () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 && !loading) {
    loadMoreGames();
  }
});

function loadMoreGames() {
  loading = true;
  fetch(`/api/latest-games?start=${startIndex}`)
    .then(res => res.json())
    .then(games => {
      games.forEach(game => fetchAndDisplayGame(game.appid, game.title));
      startIndex += pageSize;
      loading = false;
    })
    .catch(err => {
      console.error("Failed to load game list:", err);
      loading = false;
    });
}

function fetchAndDisplayGame(appId, gameName) {
  fetch(`/api/game/${appId}`)
    .then(res => res.json())
    .then(data => {
      if (!data[appId]?.success) return;
      const gameData = data[appId].data;

      const section = document.createElement('div');
      section.className = 'game-section';

      const titleLink = document.createElement('a');
      titleLink.href = `https://store.steampowered.com/app/${appId}`;
      titleLink.target = '_blank';
      titleLink.rel = 'noopener noreferrer';
      titleLink.innerHTML = `<h2>${gameName}</h2>`;
      section.appendChild(titleLink);

      const scroller = document.createElement('div');
      scroller.className = 'scroll-row';

      (gameData.screenshots || []).forEach(ss => {
        const img = document.createElement('img');
        img.src = ss.path_full;
        img.alt = gameName;
        img.onclick = () => window.open(ss.path_full, '_blank');
        scroller.appendChild(img);
      });

      section.appendChild(scroller);
      grid.appendChild(section);
    })
    .catch(err => console.error(`Failed to load screenshots for ${gameName}`, err));
}

loadMoreGames();
