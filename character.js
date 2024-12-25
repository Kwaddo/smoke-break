// Character properties
let characterPosition = { x: 0, y: 0 }; // Starting position (top-left corner)
let characterTile;
let lastMoveTime = 0; // Time of the last move
const moveInterval = 500; // Move every 5 seconds (5000 ms)
let isMoving = false; // To prevent multiple simultaneous moves

// Function to create and position the character
function createCharacter() {
    const character = document.createElement('div');
    character.classList.add('character'); // Add a CSS class for styling
    tilemapContainer.appendChild(character); // Use the existing tilemapContainer from tilemap.js

    // Store reference to the character element
    characterTile = character; 
    updateCharacterPosition();

    // Add click event to remove character and show "YOU WIN!" popup
    characterTile.addEventListener('click', () => {
        removeCharacter();  // Remove the character
        showWinPopup();  // Display the win popup
    });
}

// Function to update the character's position on the grid
function updateCharacterPosition() {
    // Calculate the position to center the character within its tile
    const left = characterPosition.x * tileSize + (tileSize / 2) - (characterTile.offsetWidth / 2);
    const top = characterPosition.y * tileSize + (tileSize / 2) - (characterTile.offsetHeight / 2);

    // Apply the calculated position to the character
    characterTile.style.left = `${left}px`;
    characterTile.style.top = `${top}px`;
}

// Function to check if the character can move to the given tile
function isValidMove(x, y) {
    // Ensure the character stays within the grid bounds and on walkable tiles (grass)
    if (x < 0 || x >= columns || y < 0 || y >= rows) {
        return false; // Out of bounds
    }

    const tile = tiles[y * columns + x]; // Get the tile at the new position
    return tile && !tile.classList.contains('wall') && !tile.classList.contains('water'); // Can only walk on grass
}

// Function to move the character randomly
function moveCharacterRandomly() {
    const directions = [
        { x: 0, y: -1 },
        { x: 0, y: 1 },
        { x: -1, y: 0 },
        { x: 1, y: 0 }  
    ];

    const direction = directions[Math.floor(Math.random() * directions.length)];
    const newX = characterPosition.x + direction.x;
    const newY = characterPosition.y + direction.y;

    if (isValidMove(newX, newY)) {
        characterPosition.x = newX;
        characterPosition.y = newY;
        updateCharacterPosition();
    }
}

// Function to animate the game loop (move every 5 seconds)
function gameLoop(timestamp) {
    // Calculate elapsed time from the last frame
    if (!lastMoveTime) lastMoveTime = timestamp;

    const deltaTime = timestamp - lastMoveTime;

    // Move character at the specified interval
    if (deltaTime > moveInterval) {
        if (!isMoving) {
            isMoving = true;
            moveCharacterRandomly(); // Move the character randomly
            lastMoveTime = timestamp; // Reset last move time
        }
    } else {
        isMoving = false;
    }

    // Continue the animation loop
    requestAnimationFrame(gameLoop);
}

// Function to remove the character
function removeCharacter() {
    if (characterTile) {
        tilemapContainer.removeChild(characterTile); // Remove the character element from the DOM
        characterTile = null; // Reset the character reference
    }
}

// Function to show the "YOU WIN!" popup
function showWinPopup() {
    const popup = document.createElement('div');
    popup.classList.add('popup');
    popup.innerText = 'YOU WIN!';
    document.body.appendChild(popup);

    // Style the popup
    setTimeout(() => {
        popup.style.opacity = 1;
    }, 100);

    setTimeout(() => {
        popup.style.opacity = 0;
        setTimeout(() => {
            document.body.removeChild(popup); // Remove the popup after fading out
        }, 300);
    }, 2000); // Fade out after 2 seconds
}

// Initialize character and animation
function initCharacter() {
    createCharacter();
    requestAnimationFrame(gameLoop); // Start the game loop with requestAnimationFrame
}

// Rebuild tilemap when resizing the window
window.addEventListener('resize', () => {
    calculateTileSize(); // Recalculate tile size and grid
    updateCharacterPosition(); // Update character position on resize
});

// Initialize the character and tilemap on load
initCharacter();
