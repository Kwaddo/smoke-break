// Global variables for the tilemap
const tilemapContainer = document.getElementById('tilemap-container');
let tileSize;
let columns;
let rows;
let tiles = [];

// Function to calculate the tile size and adjust the grid
function calculateTileSize() {
    const screenWidth = window.innerWidth/2.1;
    const screenHeight = window.innerHeight;

    // Set the maximum tile size based on the smaller dimension of the screen
    tileSize = Math.floor(Math.min(screenWidth, screenHeight) / 20); // Use 20 tiles to cover the screen

    // Calculate number of rows and columns
    columns = Math.floor(screenWidth / tileSize);
    rows = Math.floor(screenHeight / tileSize);
}

// Function to create the tilemap
function createTilemap() {
    calculateTileSize(); // Recalculate the tile size and grid dimensions

    // Set grid template to create the desired number of columns and rows
    tilemapContainer.style.gridTemplateColumns = `repeat(${columns}, ${tileSize}px)`;
    tilemapContainer.style.gridTemplateRows = `repeat(${rows}, ${tileSize}px)`;

    // Create and append tiles to the container
    tiles = [];
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
            const tile = document.createElement('div');
            tile.classList.add('tile', 'grass'); // Set default tile type to 'grass'

            // Add event listener to toggle tile types
            tile.addEventListener('click', () => toggleTileType(row, col));

            tilemapContainer.appendChild(tile);
            tiles.push(tile); // Store the tile in the global tiles array
        }
    }
}

// Function to toggle tile types on click
function toggleTileType(row, col) {
    const index = row * columns + col;
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
    tilemapContainer.innerHTML = ''; // Clear existing tiles
    createTilemap(); // Recreate the tilemap
});

// Initialize the tilemap on load
createTilemap();
