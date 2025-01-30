import { winningCharacter, removeCharacter, showWinPopup } from './character.js';

let tileSize; 
let columns;  
let rows; 

function initPlayer() {
    const player = document.createElement('div');
    player.id = 'player';

    let startX, startY;
    startX = columns + 8;
    startY = rows - 14;

    console.log("Player Start Position:", startX, startY); // Debugging

    player.style.left = `${startX * tileSize}px`;
    player.style.top = `${startY * tileSize}px`;

    document.body.appendChild(player);
    player.dataset.x = startX;
    player.dataset.y = startY;
}

function isValidPlayerMove(x, y) {
    return x >= 18.5 && x < 51 && y >= 2 && y <= 30;
}

function movePlayer(e) {
    const player = document.getElementById('player');
    let x = parseInt(player.dataset.x);
    let y = parseInt(player.dataset.y);

    let newX = x, newY = y;
    switch (e.key) {
        case 'ArrowLeft':
            newX = x - 1;
            break;
        case 'ArrowRight':
            newX = x + 1;
            break;
        case 'ArrowUp':
            newY = y - 1;
            break;
        case 'ArrowDown':
            newY = y + 1;
            break;
    }

    console.log("New Position:", newX, newY, "Is Valid?", isValidPlayerMove(newX, newY));

    if (isValidPlayerMove(newX, newY)) { 
        player.dataset.x = newX;
        player.dataset.y = newY;

        player.style.left = `${newX * tileSize}px`;
        player.style.top = `${newY * tileSize}px`;

        if (
            Math.abs(newX - winningCharacter.position.x) <= 8 &&
            Math.abs(newY - winningCharacter.position.y) <= 8
        ) {
            showWinPopup();
            removeCharacter(winningCharacter);
            winningCharacter = null;
        }
    }
}

function setupPlayer() {
    tileSize = parseInt(tilemapContainer.style.gridTemplateColumns.split(' ')[1]);
    columns = parseInt(tilemapContainer.style.gridTemplateColumns.split(' ')[0].replace('repeat(', ''));
    rows = parseInt(tilemapContainer.style.gridTemplateRows.split(' ')[0].replace('repeat(', ''));

    initPlayer();
    window.addEventListener('keydown', movePlayer);
}

setupPlayer();
