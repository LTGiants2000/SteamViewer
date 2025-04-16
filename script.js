// script.js
const grid = document.getElementById('game-container');
const searchInput = document.getElementById('search-input');
const genreSelect = document.getElementById('genre-select');

// Fetch search page results from backend scraper
function fetchSteamGames() {
  fetch('/api/latest-games')
    .then(res => res.json())
    .then(games => {
      grid.innerHTML = ''; // Clear previous results
      games.forEach(game => fetchAndDisplayGame(game.appid, game.title));
    })
    .catch(err => {
      console.error("Failed to load game list:", err);
    });
}

function fetchAndDisplayGame(appId, gameName) {
  fetch(`/api/game/${appId}`)
    .then(res => res.json())
    .then(data => {
      if (!data[appId]?.success) return;
      const gameData = data[appId].data;

      // Optional: genre filter
      const selectedGenre = genreSelect.value;
      if (selectedGenre && !gameData.genres?.some(g => g.description.toLowerCase() === selectedGenre.toLowerCase())) {
        return;
      }

      const section = document.createElement('div');
      section.className = 'game-section';

      const titleLink = document.createElement('a');
      titleLink.href = `https://store.steampowered.com/app/${appId}`;
      titleLink.target = '_blank';
      titleLink.rel = 'noopener noreferrer';
      titleLink.innerHTML = `<h2>${gameName}</h2>`;
      section.appendChild(titleLink);

      const screenshots = gameData.screenshots || [];
      const scroller = document.createElement('div');
      scroller.className = 'scroll-row';

      screenshots.forEach(ss => {
        const imgLink = document.createElement('a');
        imgLink.href = `https://store.steampowered.com/app/${appId}`;
        imgLink.target = '_blank';
        imgLink.rel = 'noopener noreferrer';

        const img = document.createElement('img');
        img.src = ss.path_full;
        img.alt = gameName;

        imgLink.appendChild(img);
        scroller.appendChild(imgLink);
      });

      section.appendChild(scroller);
      grid.appendChild(section);
    })
    .catch(err => console.error(`Failed to load screenshots for ${gameName}`, err));
}

// Filter by search text
searchInput.addEventListener('input', () => {
  const query = searchInput.value.toLowerCase();
  const gameSections = document.querySelectorAll('.game-section');
  gameSections.forEach(section => {
    const title = section.querySelector('h2').textContent.toLowerCase();
    section.style.display = title.includes(query) ? '' : 'none';
  });
});

// Genre filter
genreSelect.addEventListener('change', () => {
  fetchSteamGames();
});

// Initial load
fetchSteamGames();
