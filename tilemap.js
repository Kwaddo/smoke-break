const tilemapContainer = document.getElementById('tilemap-container');

// Function to calculate the tile size and adjust the grid
function calculateTileSize() {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    // Set the maximum tile size based on the smaller dimension of the screen
    const tileSize = Math.floor(Math.min(screenWidth, screenHeight) / 20); // Use 20 tiles to cover the screen

    // Calculate number of rows and columns
    const columns = Math.floor(screenWidth / tileSize);
    const rows = Math.floor(screenHeight / tileSize);

    return { tileSize, columns, rows };
}

// Function to create the tilemap
function createTilemap() {
    const { tileSize, columns, rows } = calculateTileSize();

    // Set grid template to create the desired number of columns and rows
    tilemapContainer.style.gridTemplateColumns = `repeat(${columns}, ${tileSize}px)`;
    tilemapContainer.style.gridTemplateRows = `repeat(${rows}, ${tileSize}px)`;

    // Create and append tiles to the container
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
            const tile = document.createElement('div');
            tile.classList.add('tile', 'grass'); // Set default tile type to 'grass'

            // Add event listener to toggle tile types
            tile.addEventListener('click', () => toggleTileType(row, col));

            tilemapContainer.appendChild(tile);
        }
    }
}

// Function to toggle tile types on click
function toggleTileType(row, col) {
    const tiles = tilemapContainer.children;
    const index = row * Math.floor(window.innerWidth / calculateTileSize().tileSize) + col;
    const tile = tiles[index];
    const currentTile = tile.classList.contains('grass') ? 'grass' :
        tile.classList.contains('wall') ? 'wall' : 'water';

    // Toggle the tile type
    if (currentTile === 'grass') {
        tile.classList.remove('grass');
        tile.classList.add('wall');
    } else if (currentTile === 'wall') {
        tile.classList.remove('wall');
        tile.classList.add('water');
    } else {
        tile.classList.remove('water');
        tile.classList.add('grass');
    }
}

// Rebuild tilemap when resizing the window
window.addEventListener('resize', () => {
    tilemapContainer.innerHTML = '';
    createTilemap();
});

// Initialize the tilemap on load
createTilemap();
