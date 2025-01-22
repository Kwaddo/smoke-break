const tilemapContainer = document.getElementById('tilemap-container');
const mapElement = document.querySelector('.map'); // Select the map element
let tileSize;
let columns;
let rows;
let tiles = [];

function calculateTileSize() {
    const screenWidth = window.innerWidth / 2.1;
    const screenHeight = window.innerHeight / 1.1;

    // Set the maximum tile size based on the smaller dimension of the screen
    tileSize = Math.floor(Math.min(screenWidth, screenHeight) / 30);

    // Calculate number of rows and columns
    columns = Math.floor(screenWidth / tileSize);
    rows = Math.floor(screenHeight / tileSize);

    // Adjust the dimensions of the tilemap and map
    tilemapContainer.style.width = `${columns * tileSize}px`;
    tilemapContainer.style.height = `${rows * tileSize}px`;

    mapElement.style.width = `${columns * tileSize}px`;
    mapElement.style.height = `${rows * tileSize}px`;

    mapElement.style.backgroundSize = `${columns * tileSize}px ${rows * tileSize}px`; // Scale the background image
}

// Function to create the tilemap
function createTilemap() {
    calculateTileSize(); // Recalculate the tile size and grid dimensions

    // Set grid template to create the desired number of columns and rows
    tilemapContainer.style.gridTemplateColumns = `repeat(${columns}, ${tileSize}px)`;
    tilemapContainer.style.gridTemplateRows = `repeat(${rows}, ${tileSize}px)`;

    // Calculate the center positions
    const centerRow = Math.floor(rows / 2);
    const centerCol = Math.floor(columns / 2);

    tiles = [];
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < columns; col++) {
            const tile = document.createElement('div');
            tile.classList.add('tile'); // Add the base tile class

            // Check if this tile is in the center
            if (
                (row === centerRow && col === centerCol) || // Center tile
                (row === centerRow - 1 && col === centerCol) || // Tile above center
                (row === centerRow + 1 && col === centerCol) || // Tile below center
                (row === centerRow && col === centerCol - 1) || // Tile left of center
                (row === centerRow && col === centerCol + 1)    // Tile right of center
            ) {
                tile.classList.add('wall'); // Set default type to 'wall'
            } else {
                tile.classList.add('empty'); // Default to 'grass'
            }

            tilemapContainer.appendChild(tile);
            tiles.push(tile); // Store the tile in the global tiles array
        }
    }
}

// Rebuild tilemap when resizing the window
window.addEventListener('resize', () => {
    tilemapContainer.innerHTML = ''; // Clear existing tiles
    createTilemap(); // Recreate the tilemap
});

// Initialize the tilemap on load
createTilemap();
