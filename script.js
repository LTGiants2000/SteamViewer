let start = 0;
const loadMore = () => {
  fetch(`/api/latest-games?start=${start}`)
    .then(res => res.json())
    .then(data => {
      const list = document.getElementById("game-list");
      data.forEach(game => {
        const div = document.createElement("div");
        div.innerHTML = `<h3>${game.title}</h3>`;
        list.appendChild(div);
      });
      start += data.length;
    })
    .catch(err => console.error("Failed to load game list:", err));
};

document.getElementById("loadMore").addEventListener("click", loadMore);
window.onload = loadMore;
