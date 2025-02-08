let activeHints = [];
const spawnInterval = 5000; 
let hintScore = 0;

const uselessHints = [
    "The characters are many colors!",
    "Use arrow keys to move.",
    "Don't touch the other characters!",
    "Ahmed loves chess.",
    "Press ESC to pause.",
    "Time is running out!",
];

const colorNames = {
    '#FF9999': 'Red',   // Light Red
    '#FF6666': 'Red',  // Medium Red
    '#CC3333': 'Red',    // Dark Red
    '#99CCFF': 'Blue',  // Light Blue
    '#6699FF': 'Blue', // Medium Blue
    '#3366CC': 'Blue',   // Dark Blue
    '#99FF99': 'Green', // Light Green
    '#66CC66': 'Green',// Medium Green
    '#339933': 'Green'   // Dark Green
};

const hintTypes = {
    QUADRANT: 0.25,
    COLOR: 0.25,
    USELESS: 0.50
};

function getColorName(hexColor) {
    return colorNames[hexColor] || 'Unknown';
}

function getQuadrant(x, y) {
    const midX = Math.floor(window.columns / 2);
    const midY = Math.floor(window.rows / 2);
    
    if (x < midX && y < midY) return "top left";
    if (x >= midX && y < midY) return "top right";
    if (x < midX && y >= midY) return "bottom left";
    return "bottom right";
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
    hint.style.textShadow = "0 0 10px rgb(255, 255, 255)";
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

    const random = Math.random();
    if (window.winningCharacter) {
        if (random < hintTypes.QUADRANT) {
            const quadrant = getQuadrant(
                window.winningCharacter.position.x,
                window.winningCharacter.position.y
            );
            hint.dataset.message = `The winning character is in the ${quadrant} quadrant!`;
        } else if (random < hintTypes.QUADRANT + hintTypes.COLOR) {
            const colorName = getColorName(window.winningCharacter.color);
            hint.dataset.message = `Look for the ${colorName.toLowerCase()} character!`;
        } else {
            hint.dataset.message = uselessHints[Math.floor(Math.random() * uselessHints.length)];
        }
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
            if (hintScore === 20) {
                popup.innerText = hint.dataset.message + "\n\nYou're getting close to finding Ahmed!";
            } else {
                popup.innerText = hint.dataset.message;
            }
            document.body.appendChild(popup);
            popup.style.opacity = 1;
            hint.remove();
            activeHints.splice(index, 1);
            updateHintScore(10);
            window.updateCountdown();
            setTimeout(() => {
                popup.style.opacity = 0;
                setTimeout(() => popup.remove(), 300);
            }, 2000);
        }
    });
}

function updateHintScore(points) {
    hintScore += points;
    window.hintScore = hintScore;
    window.updateScoreDisplay();
}

function startHintSystem() {
    setInterval(() => {
        if (!window.isPaused && activeHints.length === 0) {
            createHint();
        }
    }, spawnInterval);
}

function clearHints() {
    const hints = document.querySelectorAll('.hint');
    hints.forEach(hint => hint.remove());
    activeHints = [];
    hintScore = 0;
    window.hintScore = 0;
    const popups = document.querySelectorAll('.popup');
    popups.forEach(popup => popup.remove());
    window.updateScoreDisplay();
}

window.clearHints = clearHints;
window.checkHintCollision = checkHintCollision;
window.startHintSystem = startHintSystem;
window.hintScore = hintScore;