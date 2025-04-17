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
      const release = gameData.release_date?.date || "TBD";
      const description = (gameData.short_description || "No description available.").slice(0, 200) + "...";
      const screenshots = gameData.screenshots || [];

      const section = document.createElement('div');
      section.className = 'game-section';

      const title = document.createElement('h2');
      title.innerHTML = `
        <a href="https://store.steampowered.com/app/${appId}" target="_blank" rel="noopener noreferrer">
          ${gameName}
        </a>
        <span class="release-date">(${release})</span>
      `;
      section.appendChild(title);

      const desc = document.createElement('p');
      desc.className = 'game-description';
      desc.textContent = description;
      section.appendChild(desc);

      const mainImage = document.createElement('img');
      mainImage.className = 'main-image';
      mainImage.src = screenshots[0]?.path_full || '';
      mainImage.alt = gameName;

      const previewContainer = document.createElement('div');
      previewContainer.className = 'stacked-previews';

      screenshots.slice(1, 4).forEach(ss => {
        const img = document.createElement('img');
        img.src = ss.path_thumbnail;
        img.alt = gameName;
        img.onclick = () => {
          mainImage.src = ss.path_full;
        };
        previewContainer.appendChild(img);
      });

      section.appendChild(mainImage);
      section.appendChild(previewContainer);
      grid.appendChild(section);
    })
    .catch(err => console.error(`Failed to load screenshots for ${gameName}`, err));
}

loadMoreGames();
