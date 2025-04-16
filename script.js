const grid = document.getElementById('game-container');
let startIndex = 0;
let loading = false;
const pageSize = 20;

// Auto-load on scroll
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
        const imgWrapper = document.createElement('div');
        imgWrapper.style.position = 'relative';

        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.innerHTML = `
          <strong>Release:</strong> ${gameData.release_date?.date || 'N/A'}<br>
          <strong>Price:</strong> ${gameData.price_overview?.final_formatted || 'Free'}<br>
          <strong>Genres:</strong> ${(gameData.genres || []).map(g => g.description).join(', ')}<br>
          <strong>Desc:</strong> ${gameData.short_description || 'No description.'}
        `;

        const imgLink = document.createElement('a');
        imgLink.href = `https://store.steampowered.com/app/${appId}`;
        imgLink.target = '_blank';
        imgLink.rel = 'noopener noreferrer';

        const img = document.createElement('img');
        img.src = ss.path_full;
        img.alt = gameName;

        imgWrapper.appendChild(imgLink);
        imgWrapper.appendChild(tooltip);
        imgLink.appendChild(img);
        imgWrapper.addEventListener('mouseenter', () => tooltip.style.display = 'block');
        imgWrapper.addEventListener('mouseleave', () => tooltip.style.display = 'none');

        scroller.appendChild(imgWrapper);
      });

      section.appendChild(scroller);
      grid.appendChild(section);
    })
    .catch(err => console.error(`Failed to load screenshots for ${gameName}`, err));
}

// Initial load
loadMoreGames();
