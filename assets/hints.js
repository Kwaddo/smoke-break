let activeHints = [];
const spawnInterval = 5000; 
const chance = 0.1;

const uselessHints = [
    "The characters are white.",
    "Use arrow keys to move.",
    "Don't touch the other characters!",
    "The walls are black.",
    "Press ESC to pause.",
    "Time is running out!",
];

const colorNames = {
    '#FF0000': 'Red',
    '#00FF00': 'Green',
    '#0000FF': 'Blue',
    '#FFFF00': 'Yellow',
    '#FF00FF': 'Magenta',
    '#00FFFF': 'Cyan',
    '#FFA500': 'Orange'
};

function getColorName(hexColor) {
    return colorNames[hexColor] || 'Unknown';
}

function createHint() {
    const hint = document.createElement("div");
    hint.classList.add("hint");
    hint.style.position = "absolute";
    hint.style.width = `${window.tileSize}px`;
    hint.style.height = `${window.tileSize}px`;
    hint.style.backgroundImage = "url('./assets/images/question.svg')";
    hint.style.backgroundSize = "contain";
    hint.style.backgroundRepeat = "no-repeat";
    hint.style.backgroundPosition = "center";
    hint.style.boxShadow = "0 0 10px rgb(255, 255, 255)";
    hint.style.zIndex = "999";
    hint.style.animation = "pulse 1s infinite";
    let hintX, hintY;
    do {
        hintX = Math.floor(Math.random() * window.columns);
        hintY = Math.floor(Math.random() * window.rows);
    } while (!window.isValidMove(hintX, hintY));
    const left = hintX * window.tileSize;
    const top = hintY * window.tileSize;
    
    hint.style.left = `${left}px`;
    hint.style.top = `${top}px`;
    hint.dataset.x = hintX;
    hint.dataset.y = hintY;

    if (Math.random() < chance && window.winningCharacter) {
        const colorName = getColorName(window.winningCharacter.color);
        const position = `Look for the ${colorName.toLowerCase()} character!`;
        hint.dataset.message = position;
    } else {
        hint.dataset.message = uselessHints[Math.floor(Math.random() * uselessHints.length)];
    }

    window.tilemapContainer.appendChild(hint);
    activeHints.push(hint);
}

function checkHintCollision(playerX, playerY) {
    activeHints.forEach((hint, index) => {
        const hintX = parseInt(hint.dataset.x);
        const hintY = parseInt(hint.dataset.y);

        if (playerX === hintX && playerY === hintY) {
            const popup = document.createElement("div");
            popup.classList.add("popup");
            popup.innerText = hint.dataset.message;
            document.body.appendChild(popup);
            popup.style.opacity = 1;
            hint.remove();
            activeHints.splice(index, 1);
            window.countdownTime += 5;
            window.updateCountdown();
            setTimeout(() => {
                popup.style.opacity = 0;
                setTimeout(() => popup.remove(), 300);
            }, 2000);
        }
    });
}

function startHintSystem() {
    setInterval(() => {
        if (!window.isPaused && activeHints.length === 0) {
            createHint();
        }
    }, spawnInterval);
}

function clearHints() {
    activeHints.forEach(hint => hint.remove());
    activeHints = [];
}

window.clearHints = clearHints;
window.checkHintCollision = checkHintCollision;
window.startHintSystem = startHintSystem;