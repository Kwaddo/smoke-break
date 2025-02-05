const mapColorSchemes = {
    map1: [ // Afternoon colors
        '#FF9966', // Sunset Orange
        '#FFB366', // Light Orange
        '#FF8533', // Deep Orange
        '#FF6600', // Bright Orange
        '#CC5200', // Dark Orange
        '#FF944D', // Peach
        '#FF7F2A', // Tangerine
        '#CC6600'  // Brown Orange
    ],
    map2: [ // Night colors
        '#6666FF', // Blue
        '#3333FF', // Deep Blue
        '#0000FF', // Pure Blue
        '#0000CC', // Dark Blue
        '#000099', // Navy
        '#4D4DFF', // Light Blue
        '#1A1AFF', // Medium Blue
        '#0000B3'  // Royal Blue
    ],
    map3: [ // Morning colors
        '#99FF99', // Light Green
        '#66FF66', // Bright Green
        '#33FF33', // Lime Green
        '#00FF00', // Pure Green
        '#00CC00', // Dark Green
        '#009900', // Forest Green
        '#66CC66', // Sage Green
        '#339933'  // Medium Green
    ]
};

function getCharacterColors() {
    const selectedMap = getSelectedMap();
    return mapColorSchemes[selectedMap] || mapColorSchemes.map1;
}

let characters = [];
const numCharacters = 7;
let winningCharacter = null;
let player1 = null;
let gameStarted = false;
let isPaused = false;
let gameTimer = 60;
let startTime = null;
let timerElement = null;
let pauseStartTime = null;
let totalPausedTime = 0;
let pauseMenu = null;

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function createTimer() {
    timerElement = document.createElement('div');
    timerElement.classList.add('timer');
    timerElement.style.position = 'fixed';
    timerElement.style.top = '50px';
    timerElement.style.left = '50%';
    timerElement.style.transform = 'translateX(-50%)';
    timerElement.style.zIndex = '1000';
    timerElement.style.backgroundColor = 'rgba(0, 0, 0, 0.5=7)';
    timerElement.style.padding = '10px 20px';
    timerElement.style.borderRadius = '5px';
    timerElement.style.fontFamily = 'Sixtyfour, sans-serif';
    timerElement.style.fontSize = '24px';
    timerElement.style.color = 'white';
    document.body.appendChild(timerElement);
}

function initMultiplayerGame() {
    createTimer();
    startTime = Date.now();
    gameTimer = 60;
    document.getElementById("game-menu").style.display = "none";
    gameStarted = true;
    characters = [];
    window.characters = characters;
    
    let availableColors = [...getCharacterColors()];
    shuffleArray(availableColors);
    
    const player2Color = availableColors.pop();
    availableColors = shuffleArray(availableColors);

    for (let i = 0; i < numCharacters; i++) {
        let startX, startY;
        do {
            startX = Math.floor(Math.random() * window.columns);
            startY = Math.floor(Math.random() * window.rows);
        } while (!window.isValidMove(startX, startY) || isOccupiedByCharacter(startX, startY));
        createCharacter(startX, startY, availableColors[i]);
    }

    let startX, startY;
    do {
        startX = Math.floor(Math.random() * window.columns);
        startY = Math.floor(Math.random() * window.rows);
    } while (!window.isValidMove(startX, startY) || isOccupiedByCharacter(startX, startY));

    winningCharacter = createPlayerControlledCharacter(startX, startY, player2Color);
    window.winningCharacter = winningCharacter;

    initPlayer();
    requestAnimationFrame(gameLoop);
}

function createCharacter(startX, startY, color) {
    const character = document.createElement('div');
    character.classList.add('character');
    character.style.backgroundColor = color;
    window.tilemapContainer.appendChild(character);

    const characterObj = {
        element: character,
        position: { x: startX, y: startY },
        isWinningCharacter: false,
        color: color,
        moveInterval: Math.floor(Math.random() * (750 - 250 + 1) + 800),
        lastMoveTime: null
    };
    
    characters.push(characterObj);
    updateCharacterPosition(characterObj);
    return characterObj;
}

function createPlayerControlledCharacter(startX, startY, color) {
    const character = document.createElement('div');
    character.classList.add('character', 'winning-character');
    character.style.backgroundColor = color;
    window.tilemapContainer.appendChild(character);

    const characterObj = {
        element: character,
        position: { x: startX, y: startY },
        isWinningCharacter: true,
        color: color,
        isPlayerControlled: true
    };
    
    characters.push(characterObj);
    updateCharacterPosition(characterObj);
    return characterObj;
}

function updateCharacterPosition(character) {
    const left = character.position.x * window.tileSize;
    const top = character.position.y * window.tileSize;
    character.element.style.left = `${left}px`;
    character.element.style.top = `${top}px`;
}

function isOccupiedByCharacter(x, y) {
    return characters.some(char => char.position.x === x && char.position.y === y);
}

function moveWinningCharacter(e) {
    if (!gameStarted || !winningCharacter) return;

    const x = winningCharacter.position.x;
    const y = winningCharacter.position.y;
    let newX = x, newY = y;

    switch(e.key) {
        case "w": newY = y - 1; break;
        case "s": newY = y + 1; break;
        case "a": newX = x - 1; break;
        case "d": newX = x + 1; break;
    }

    if (window.isValidMove(newX, newY)) {
        const collidingChar = characters.find(char => 
            !char.isWinningCharacter && 
            char.position.x === newX && 
            char.position.y === newY
        );
        if (!collidingChar) {
            winningCharacter.position.x = newX;
            winningCharacter.position.y = newY;
            updateCharacterPosition(winningCharacter);
        }
    }
}

function gameLoop(timestamp) {
    if (!isPaused && gameStarted) {
        const currentTime = Date.now();
        const adjustedTime = currentTime - totalPausedTime;
        const elapsedSeconds = Math.floor((adjustedTime - startTime) / 1000);
        const remainingTime = Math.max(0, gameTimer - elapsedSeconds);
        
        timerElement.textContent = `Time: ${remainingTime}s`;
        
        if (remainingTime === 0) {
            showWinPopup("Time's Up - Ahmed Wins!");
            return;
        }

        characters.forEach(character => {
            if (!character.isPlayerControlled && !character.lastMoveTime) {
                character.lastMoveTime = timestamp;
            }
            if (!character.isPlayerControlled) {
                const deltaTime = timestamp - character.lastMoveTime;
                if (deltaTime > character.moveInterval) {
                    moveCharacterRandomly(character);
                    character.lastMoveTime = timestamp;
                }
            }
        });
    }
    requestAnimationFrame(gameLoop);
}

window.addEventListener("keydown", (e) => {
    if (["w", "s", "a", "d"].includes(e.key)) {
        moveWinningCharacter(e);
    } else if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(e.key)) {
        movePlayer1(e);
    } else if (e.key === "Escape") {
        togglePause();
    } else if (e.key === " " && !gameStarted) {
        initMultiplayerGame();
    }
});

document.getElementById("start-game").addEventListener("click", () => {
    initMultiplayerGame();
});

function initPlayer() {
    const player = document.createElement("div");
    player.id = "player";
    player.classList.add("player1");

    let startX, startY;
    do {
        startX = Math.floor(window.columns / 1.4);
        startY = Math.floor(window.rows / 2.1);
    } while (!window.isValidMove(startX, startY));

    updatePlayerPosition(player, startX, startY);
    window.tilemapContainer.appendChild(player);
    player.dataset.x = startX;
    player.dataset.y = startY;
    
    player1 = player;
    return player;
}

function updatePlayerPosition(player, x, y) {
    const left = x * window.tileSize + window.tileSize / 2 - player.offsetWidth / 2;
    const top = y * window.tileSize + window.tileSize / 2 - player.offsetHeight / 2;
    player.style.left = `${left}px`;
    player.style.top = `${top}px`;
}

function movePlayer1(e) {
    if (isPaused || !player1) return;

    const x = Number.parseInt(player1.dataset.x, 10);
    const y = Number.parseInt(player1.dataset.y, 10);
    let newX = x, newY = y;

    switch (e.key) {
        case "ArrowLeft": newX = x - 1; break;
        case "ArrowRight": newX = x + 1; break;
        case "ArrowUp": newY = y - 1; break;
        case "ArrowDown": newY = y + 1; break;
    }

    if (window.isValidMove(newX, newY)) {
        player1.classList.add("moving");
        player1.dataset.x = newX;
        player1.dataset.y = newY;
        updatePlayerPosition(player1, newX, newY);

        for (const character of characters) {
            if (!character.isWinningCharacter && 
                newX === character.position.x && 
                newY === character.position.y) {
                showWinPopup("Ahmed Wins!");
                return;
            }
        }

        if (winningCharacter &&
            newX === winningCharacter.position.x &&
            newY === winningCharacter.position.y) {
            showWinPopup("Student Wins!");
        }

        setTimeout(() => {
            player1.classList.remove("moving");
        }, 400);
    }
}

function showWinPopup(winner) {
    characters.forEach(character => {
        if (character.element) {
            character.element.remove();
        }
    });
    if (player1) player1.remove();
    const popup = document.createElement("div");
    popup.classList.add("popup");
    popup.innerText = `${winner}`;
    popup.style.opacity = 0;
    document.body.appendChild(popup);
    requestAnimationFrame(() => {
        popup.style.opacity = 1;
    });
    setTimeout(() => {
        popup.style.opacity = 0;
        setTimeout(() => {
            document.body.removeChild(popup);
            resetGame();
        }, 500);
    },1500);
}

function endGame() {
    if (timerElement) {
        timerElement.remove();
        timerElement = null;
    }
    if (pauseMenu) {
        pauseMenu.remove();
        pauseMenu = null;
    }
    startTime = null;
    pauseStartTime = null;
    totalPausedTime = 0;
    gameStarted = false;
    isPaused = false;
    characters.forEach(character => {
        if (character.element) {
            character.element.remove();
        }
    });
    characters = [];
    if (player1) player1.remove();
    player1 = null;
    winningCharacter = null;
}

function resetGame(fromMapSwitch = false) {
    endGame();
    if (!fromMapSwitch) {
        const gameMenu = document.getElementById("game-menu");
        if (gameMenu) {
            gameMenu.style.display = "flex";
        }
    }
}

function moveCharacterRandomly(characterObj) {
    if (!characters.includes(characterObj)) return;

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
        if (window.isValidMove(newX, newY) && !isOccupiedByCharacter(newX, newY, characterObj)) {
            characterObj.position.x = newX;
            characterObj.position.y = newY;
            updateCharacterPosition(characterObj);
            return;
        }
    }
}

window.addEventListener('mapchange', () => {
    if (gameStarted) {
        const newColors = getCharacterColors();
        characters.forEach((char, index) => {
            if (char.element) {
                char.element.style.backgroundColor = newColors[index % newColors.length];
                char.color = newColors[index % newColors.length];
            }
        });
    }
});

function createPauseMenu() {
    pauseMenu = document.createElement("div");
    pauseMenu.classList.add("pause-menu");
    
    const content = document.createElement("div");
    content.classList.add("pause-content");
    
    content.innerHTML = `
        <h2>Game Paused</h2>
        <button id="resumeButton">Continue</button>
    `;
    
    pauseMenu.appendChild(content);
    document.body.appendChild(pauseMenu);

    document.getElementById("resumeButton").addEventListener("click", () => {
        unpauseGame();
    });
}

function showPauseMenu() {
    if (!gameStarted) return;
    if (!pauseMenu) {
        createPauseMenu();
    }
    pauseMenu.style.display = "flex";
    isPaused = true;
}

function hidePauseMenu() {
    if (pauseMenu) {
        pauseMenu.style.display = "none";
    }
    isPaused = false;
}

function togglePause() {
    if (!gameStarted) return;
    if (isPaused) {
        unpauseGame();
    } else {
        pauseGame();
    }
}

function pauseGame() {
    if (!gameStarted) return;
    showPauseMenu();
    pauseStartTime = Date.now();
}

function unpauseGame() {
    hidePauseMenu();
    if (pauseStartTime) {
        totalPausedTime += Date.now() - pauseStartTime;
        pauseStartTime = null;
    }
}
