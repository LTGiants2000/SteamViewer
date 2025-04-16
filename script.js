const steamAppId = '1245620'; // Elden Ring
const grid = document.getElementById('screenshot-grid');

fetch(`/api/game/${steamAppId}`)
  .then(response => response.json())
  .then(data => {
    if (!data[steamAppId].success) throw new Error("Invalid game ID");

    const screenshots = data[steamAppId].data.screenshots;
    screenshots.forEach(screenshot => {
      const img = document.createElement('img');
      img.src = screenshot.path_full;
      grid.appendChild(img);
    });
  })
  .catch(error => {
    console.error("Error loading Steam data:", error);
  });
