let characters = [];
const numCharacters = 9;
let winningCharacter = null;
window.moveInterval = Math.floor(Math.random() * (750 - 250 + 1) + 800);

const characterColors = [
    '#FF9999', // Light Red
    '#FF6666', // Medium Red
    '#CC3333', // Dark Red
    '#99CCFF', // Light Blue
    '#6699FF', // Medium Blue
    '#3366CC', // Dark Blue
    '#99FF99', // Light Green
    '#66CC66', // Medium Green
    '#339933', // Dark Green
];

function isOccupiedByCharacter(x, y, excludeChar = null) {
    return characters.some(char =>
        char !== excludeChar &&
        char.position.x === x &&
        char.position.y === y
    );
}

function createCharacter(startX, startY) {
    const character = document.createElement('div');
    character.classList.add('character');
    const color = characterColors[characters.length];
    character.style.backgroundColor = color;
    window.tilemapContainer.appendChild(character);

    const characterObj = {
        element: character,
        position: { x: startX, y: startY },
        isWinningCharacter: false,
        moveInterval: window.moveInterval,
        lastMoveTime: 0,
        color: color
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
    const left = characterObj.position.x * window.tileSize + (window.tileSize / 2) - (characterObj.element.offsetWidth / 2);
    const top = characterObj.position.y * window.tileSize + (window.tileSize / 2) - (characterObj.element.offsetHeight / 2);
    characterObj.element.style.left = `${left}px`;
    characterObj.element.style.top = `${top}px`;
}

function moveCharacterRandomly(characterObj) {
    if (!window.characters.includes(characterObj)) return;

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

function removeCharacter(characterObj) {
    if (characterObj && characterObj.element) {
        window.tilemapContainer.removeChild(characterObj.element);
        const index = characters.indexOf(characterObj);
        if (index !== -1) {
            characters.splice(index, 1);
        }
    }
}

function initCharacter() {
    characters = [];
    window.characters = characters;

    for (let i = 0; i < numCharacters; i++) {
        let startX, startY;
        do {
            startX = Math.floor(Math.random() * window.columns);
            startY = Math.floor(Math.random() * window.rows);
        } while (!window.isValidMove(startX, startY) || isOccupiedByCharacter(startX, startY));
        createCharacter(startX, startY);
    }
    winningCharacter = characters[Math.floor(Math.random() * characters.length)];
    winningCharacter.isWinningCharacter = true;
    winningCharacter.element.classList.add('winning-character');
    window.winningCharacter = winningCharacter;
}

function showWinPopup() {
    alert("You win!");
}

window.moveCharacterRandomly = moveCharacterRandomly;
window.initCharacter = initCharacter;
window.updateCharacterPosition = updateCharacterPosition;
