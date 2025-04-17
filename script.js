const grid = document.getElementById('game-container');
const dateFilter = document.getElementById('dateFilter');

let allGames = [];
let gameDetailsCache = {};
let startIndex = 0;
let loading = false;
const pageSize = 10;
let filteredAppIds = [];

window.addEventListener('scroll', () => {
  if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500 && !loading) {
    loadNextBatch();
  }
});

dateFilter.addEventListener('change', () => {
  resetScroll();
  applyFilters();
});

function resetScroll() {
  startIndex = 0;
  filteredAppIds = [];
  grid.innerHTML = '';
}

function fetchAllGames() {
  const batches = [0, 15, 30, 45, 60];
  const fetches = batches.map(start =>
    fetch(`/api/latest-games?start=${start}`).then(res => res.json())
  );
  Promise.all(fetches)
    .then(results => {
      allGames = results.flat();
      applyFilters();
    })
    .catch(err => console.error("Failed to load game list:", err));
}

function applyFilters() {
  const dateVal = dateFilter.value;
  filteredAppIds = [];

  const now = new Date();

  allGames.forEach(game => {
    fetch(`/api/game/${game.appid}`)
      .then(res => res.json())
      .then(data => {
        if (!data[game.appid]?.success) return;
        const gameData = data[game.appid].data;
        const releaseDateStr = gameData.release_date?.date || '';
        const releaseDate = new Date(releaseDateStr);
        if (isNaN(releaseDate)) return;

        const daysAgo = (now - releaseDate) / (1000 * 60 * 60 * 24);
        if (
          (dateVal === "today" &&
            releaseDate.getDate() !== now.getDate()) ||
          (dateVal === "yesterday" &&
            new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1).toDateString() !== releaseDate.toDateString()) ||
          (dateVal === "thisweek" && daysAgo > 7) ||
          (dateVal === "lastweek" && (daysAgo <= 7 || daysAgo > 14)) ||
          (dateVal === "thismonth" && (
            releaseDate.getMonth() !== now.getMonth() ||
            releaseDate.getFullYear() !== now.getFullYear())) ||
          (dateVal === "lastmonth" && (
            (now.getMonth() === 0 && (releaseDate.getMonth() !== 11 || releaseDate.getFullYear() !== now.getFullYear() - 1)) ||
            (now.getMonth() !== 0 && (
              releaseDate.getMonth() !== now.getMonth() - 1 ||
              releaseDate.getFullYear() !== now.getFullYear()
            ))
          ))
        ) return;

        gameDetailsCache[game.appid] = {
          title: game.title,
          appid: game.appid,
          releaseDate: releaseDateStr,
          description: gameData.short_description || '',
          screenshots: gameData.screenshots || [],
          genres: (gameData.genres || []).map(g => g.description).join(", ")
        };

        filteredAppIds.push(game.appid);
        if (filteredAppIds.length <= pageSize) {
          displayGame(game.appid);
        }
      });
  });
}

function loadNextBatch() {
  loading = true;
  const nextAppIds = filteredAppIds.slice(startIndex, startIndex + pageSize);
  nextAppIds.forEach(appid => displayGame(appid));
  startIndex += pageSize;
  loading = false;
}

function displayGame(appid) {
  const game = gameDetailsCache[appid];
  if (!game) return;

  const section = document.createElement('div');
  section.className = 'game-section';

  const title = document.createElement('h2');
  title.innerHTML = `
    <a href="https://store.steampowered.com/app/${appid}" target="_blank" rel="noopener noreferrer">
      ${game.title}
    </a>
    <span class="release-date">(${game.releaseDate})</span>
    ${game.genres ? `<span class="genre-tag">${game.genres}</span>` : ""}
  `;
  section.appendChild(title);

  const desc = document.createElement('p');
  desc.className = 'game-description';
  desc.textContent = game.description.slice(0, 200) + "...";
  section.appendChild(desc);

  const mainImageLink = document.createElement('a');
  mainImageLink.href = game.screenshots[0]?.path_full || '#';
  mainImageLink.target = '_blank';
  mainImageLink.rel = 'noopener noreferrer';

  const mainImage = document.createElement('img');
  mainImage.className = 'main-image';
  mainImage.src = game.screenshots[0]?.path_full || '';
  mainImage.alt = game.title;

  mainImageLink.appendChild(mainImage);
  section.appendChild(mainImageLink);

  const previewContainer = document.createElement('div');
  previewContainer.className = 'stacked-previews';

  game.screenshots.slice(1, 11).forEach(ss => {
    const img = document.createElement('img');
    img.src = ss.path_thumbnail;
    img.alt = game.title;
    img.onclick = () => {
      mainImage.src = ss.path_full;
    };
    previewContainer.appendChild(img);
  });

  section.appendChild(previewContainer);
  grid.appendChild(section);
}

fetchAllGames();
