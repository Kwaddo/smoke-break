let characters = [];
const numCharacters = 5; 
let lastMoveTime = 0;
const moveInterval = 500;
let isMoving = false;

function createCharacter(startX, startY) {
    const character = document.createElement('div');
    character.classList.add('character');
    tilemapContainer.appendChild(character);
    const characterObj = {
        element: character,
        position: { x: startX, y: startY }
    };
    characters.push(characterObj);
    updateCharacterPosition(characterObj);
    character.addEventListener('click', () => {
        removeCharacter(characterObj);
        showWinPopup();
    });
}

function updateCharacterPosition(characterObj) {
    const left = characterObj.position.x * tileSize + (tileSize / 2) - (characterObj.element.offsetWidth / 2);
    const top = characterObj.position.y * tileSize + (tileSize / 2) - (characterObj.element.offsetHeight / 2);
    characterObj.element.style.left = `${left}px`;
    characterObj.element.style.top = `${top}px`;
}

function isValidMove(x, y) {
    if (x < 0 || x >= columns || y < 0 || y >= rows) {
        return false;
    }
    const tile = tiles[y * columns + x];
    return tile && !tile.classList.contains('wall');
}

function moveCharacterRandomly(characterObj) {
    const directions = [
        { x: 0, y: -1 },
        { x: 0, y: 1 },
        { x: -1, y: 0 },
        { x: 1, y: 0 }
    ];
    let shuffledDirections = [...directions].sort(() => Math.random() - 0.5);
    for (let direction of shuffledDirections) {
        const newX = characterObj.position.x + direction.x;
        const newY = characterObj.position.y + direction.y;
        if (isValidMove(newX, newY)) {
            characterObj.position.x = newX;
            characterObj.position.y = newY;
            updateCharacterPosition(characterObj);
            return;
        }
    }
}

function gameLoop(timestamp) {
    if (!lastMoveTime) lastMoveTime = timestamp;
    const deltaTime = timestamp - lastMoveTime;
    if (deltaTime > moveInterval) {
        if (!isMoving) {
            isMoving = true;
            characters.forEach(character => {
                moveCharacterRandomly(character);
            });
            lastMoveTime = timestamp;
        }
    } else {
        isMoving = false;
    }
    requestAnimationFrame(gameLoop);
}

function removeCharacter(characterObj) {
    if (characterObj && characterObj.element) {
        tilemapContainer.removeChild(characterObj.element);
        const index = characters.indexOf(characterObj);
        if (index !== -1) {
            characters.splice(index, 1);
        }
    }
}

function showWinPopup() {
    const popup = document.createElement('div');
    popup.classList.add('popup');
    popup.innerText = 'YOU WIN!';
    document.body.appendChild(popup);
    setTimeout(() => {
        popup.style.opacity = 1;
    }, 100);
    setTimeout(() => {
        popup.style.opacity = 0;
        setTimeout(() => {
            document.body.removeChild(popup);
        }, 300);
    }, 2000);
}

function initCharacter() {
    for (let i = 0; i < numCharacters; i++) {
        const startX = Math.floor(Math.random() * columns);
        const startY = Math.floor(Math.random() * rows);
        createCharacter(startX, startY);
    }
    requestAnimationFrame(gameLoop);
}

window.addEventListener('resize', () => {
    calculateTileSize();
    characters.forEach(updateCharacterPosition); 
});

initCharacter();
