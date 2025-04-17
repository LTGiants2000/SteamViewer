const grid = document.getElementById('game-container');
let startIndex = 0;
let loading = false;
const pageSize = 20;
let allGames = [];

const genreFilter = document.getElementById('genreFilter');
const tagFilter = document.getElementById('tagFilter');
const dateFilter = document.getElementById('dateFilter');

window.addEventListener('scroll', () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 && !loading) {
    loadMoreGames();
  }
});

genreFilter.addEventListener('change', applyFilters);
tagFilter.addEventListener('change', applyFilters);
dateFilter.addEventListener('change', applyFilters);

function loadMoreGames() {
  loading = true;
  fetch(`/api/latest-games?start=${startIndex}`)
    .then(res => res.json())
    .then(games => {
      allGames = allGames.concat(games);
      startIndex += pageSize;
      applyFilters();
      loading = false;
    })
    .catch(err => {
      console.error("Failed to load game list:", err);
      loading = false;
    });
}

function applyFilters() {
  const genreVal = genreFilter.value;
  const tagVal = tagFilter.value;
  const dateVal = dateFilter.value;
  grid.innerHTML = '';

  allGames.forEach(game => {
    fetch(`/api/game/${game.appid}`)
      .then(res => res.json())
      .then(data => {
        if (!data[game.appid]?.success) return;
        const gameData = data[game.appid].data;
        const releaseDateStr = gameData.release_date?.date || '';
        const shortDesc = (gameData.short_description || "No description available.").slice(0, 200) + "...";
        const screenshots = gameData.screenshots || [];
        const genres = (gameData.genres || []).map(g => g.description);
        const tags = (gameData.categories || []).map(c => c.description);

        // Filter checks
        if (genreVal && !genres.includes(genreVal)) return;
        if (tagVal && !tags.includes(tagVal)) return;
        if (dateVal) {
          const releaseDate = new Date(releaseDateStr);
          const today = new Date();
          const daysDiff = Math.floor((today - releaseDate) / (1000 * 60 * 60 * 24));
          if (dateVal === 'last7' && daysDiff > 7) return;
          if (dateVal === 'last30' && daysDiff > 30) return;
        }

        const section = document.createElement('div');
        section.className = 'game-section';

        const title = document.createElement('h2');
        title.innerHTML = `
          <a href="https://store.steampowered.com/app/${game.appid}" target="_blank" rel="noopener noreferrer">
            ${game.title}
          </a>
          <span class="release-date">(${releaseDateStr})</span>
        `;
        section.appendChild(title);

        const desc = document.createElement('p');
        desc.className = 'game-description';
        desc.textContent = shortDesc;
        section.appendChild(desc);

        const mainImage = document.createElement('img');
        mainImage.className = 'main-image';
        mainImage.src = screenshots[0]?.path_full || '';
        mainImage.alt = game.title;

        const previewContainer = document.createElement('div');
        previewContainer.className = 'stacked-previews';

        screenshots.slice(1, 11).forEach(ss => {
          const img = document.createElement('img');
          img.src = ss.path_thumbnail;
          img.alt = game.title;
          img.onclick = () => {
            mainImage.src = ss.path_full;
          };
          previewContainer.appendChild(img);
        });

        section.appendChild(mainImage);
        section.appendChild(previewContainer);
        grid.appendChild(section);
      });
  });
}

loadMoreGames();
