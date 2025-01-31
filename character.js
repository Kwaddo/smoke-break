let characters = [];
const numCharacters = 5; 
let lastMoveTime = 0;
const moveInterval = 500;
let isMoving = false;
let winningCharacter = null; 

function createCharacter(startX, startY) {
    const character = document.createElement('div');
    character.classList.add('character');
    tilemapContainer.appendChild(character);
    const characterObj = {
        element: character,
        position: { x: startX, y: startY },
        isWinningCharacter: false 
    };
    characters.push(characterObj);
    updateCharacterPosition(characterObj);
    character.addEventListener('click', () => {
        if (characterObj.isWinningCharacter) {
            showWinPopup();
            removeCharacter(characterObj);
        }
    });
}

function updateCharacterPosition(characterObj) {
    const left = characterObj.position.x * tileSize + (tileSize / 2) - (characterObj.element.offsetWidth / 2);
    const top = characterObj.position.y * tileSize + (tileSize / 2) - (characterObj.element.offsetHeight / 2);
    characterObj.element.style.left = `${left}px`;
    characterObj.element.style.top = `${top}px`;
}

function isValidMove(x, y, isPlayer) { 
    const tile = tiles[y * columns + x];
    if (!isPlayer && (x < 0 || x >= columns || y < 0 || y >= rows)){
        return false;
    }
    if (isPlayer) {
        return x > 12 && x < 38 && y >= 0 && y < 25; 
    }
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
        if (isValidMove(newX, newY, false)) {
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
    winningCharacter = characters[Math.floor(Math.random() * characters.length)];
    winningCharacter.isWinningCharacter = true;
    winningCharacter.element.classList.add('winning-character'); 

    requestAnimationFrame(gameLoop);
}

window.addEventListener('resize', () => {
    calculateTileSize();
    characters.forEach(updateCharacterPosition); 
});

function initPlayer() {
    const player = document.createElement('div');
    player.id = 'player';

    let startX, startY;
    startX = Math.floor(columns + 5);
    startY = Math.floor(rows / 2);
    console.log("Player Start Position:", startX, startY); 

    player.style.left = `${startX * tileSize}px`;
    player.style.top = `${startY * tileSize}px`;

    document.body.appendChild(player);
    player.dataset.x = startX;
    player.dataset.y = startY;
}

function movePlayer(e) {
    const player = document.getElementById('player');
    let x = parseInt(player.dataset.x, 10);
    let y = parseInt(player.dataset.y, 10);

    let newX = x, newY = y;
    switch (e.key) {
        case 'ArrowLeft': newX = x - 1; break;
        case 'ArrowRight': newX = x + 1; break;
        case 'ArrowUp': newY = y - 1; break;
        case 'ArrowDown': newY = y + 1; break;
    }

    if (isValidMove(newX, newY, true)) { 
        player.dataset.x = newX;
        player.dataset.y = newY;

        player.style.left = `${newX * tileSize}px`;
        player.style.top = `${newY * tileSize}px`;

        // console.log(`Player moved to (${newX}, ${newY})`);
        // console.log(`Winning Character at (${winningCharacter.position.x}, ${winningCharacter.position.y})`);

        if ((newX - 13) === winningCharacter.position.x && (newY) === winningCharacter.position.y) {
            showWinPopup();
            removeCharacter(winningCharacter);
            winningCharacter = null;
        }
    }
}

window.addEventListener('keyup', movePlayer);
initPlayer();
initCharacter();
