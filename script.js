const grid = document.getElementById('game-container');
const loadMoreBtn = document.getElementById('loadMoreBtn');

let startIndex = 0;
let loading = false;
const pageSize = 20;
let allGames = [];

function loadGames() {
  loading = true;
  fetch(`/api/latest-games?start=${startIndex}`)
    .then(res => res.json())
    .then(games => {
      allGames = games;
      games.forEach(game => fetchAndDisplayGame(game.appid, game.title));
      startIndex += pageSize;
      loading = false;
    })
    .catch(err => {
      console.error("Failed to load game list:", err);
      loading = false;
    });
}

loadMoreBtn.addEventListener('click', () => {
  loadGames();
});

function fetchAndDisplayGame(appId, gameName) {
  fetch(`/api/game/${appId}`)
    .then(res => res.json())
    .then(data => {
      if (!data[appId]?.success) return;
      const gameData = data[appId].data;
      const release = gameData.release_date?.date || "TBD";
      const description = (gameData.short_description || "No description available.").slice(0, 200) + "...";
      const genres = (gameData.genres || []).map(g => g.description).join(", ");
      const screenshots = gameData.screenshots || [];

      const section = document.createElement('div');
      section.className = 'game-section';

      const title = document.createElement('h2');
      title.innerHTML = `
        <a href="https://store.steampowered.com/app/${appId}" target="_blank" rel="noopener noreferrer">
          ${gameName}
        </a>
        <span class="release-date">(${release})</span>
        ${genres ? `<span class="genre-tag">${genres}</span>` : ''}
      `;
      section.appendChild(title);

      const desc = document.createElement('p');
      desc.className = 'game-description';
      desc.textContent = description;
      section.appendChild(desc);

      const mainImageLink = document.createElement('a');
      mainImageLink.href = screenshots[0]?.path_full || '#';
      mainImageLink.target = '_blank';
      mainImageLink.rel = 'noopener noreferrer';

      const mainImage = document.createElement('img');
      mainImage.className = 'main-image';
      mainImage.src = screenshots[0]?.path_full || '';
      mainImage.alt = gameName;

      mainImageLink.appendChild(mainImage);
      section.appendChild(mainImageLink);

      const previewContainer = document.createElement('div');
      previewContainer.className = 'stacked-previews';

      screenshots.slice(1, 11).forEach(ss => {
        const img = document.createElement('img');
        img.src = ss.path_thumbnail;
        img.alt = gameName;
        img.onclick = () => {
          mainImage.src = ss.path_full;
        };
        previewContainer.appendChild(img);
      });

      section.appendChild(previewContainer);
      grid.appendChild(section);
    })
    .catch(err => console.error(`Failed to load screenshots for ${gameName}`, err));
}

loadGames();
