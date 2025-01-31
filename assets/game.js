let lastMoveTime = 0
const moveInterval = 500
let isMoving = false
let isPaused = false
let gameStarted = false
let pauseMenu
let countdownTime = 120;
let countdownInterval;
let countdownDisplay;
let score = 0;

document.getElementById("start-game").addEventListener("click", () => {
    document.getElementById("game-menu").style.display = "none";
    initGame();
});

function resetGame() {
    window.characters.forEach(character => {
        if (character.element) {
            character.element.remove();
        }
    });
    window.characters = [];
    removePlayer();
    window.winningCharacter = null;
    gameStarted = false;
    if (countdownDisplay) {
        countdownDisplay.remove();
        countdownDisplay = null;
    }
    clearInterval(countdownInterval);
    document.getElementById("game-menu").style.display = "flex";
}

function createCountdownTimer() {
    countdownDisplay = document.createElement("div");
    countdownDisplay.id = "countdown-timer";
    countdownDisplay.style.position = "absolute";
    countdownDisplay.style.top = "10px";
    countdownDisplay.style.right = "45%";
    countdownDisplay.style.fontSize = "24px";
    countdownDisplay.style.color = "white";
    countdownDisplay.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
    countdownDisplay.style.padding = "10px";
    countdownDisplay.style.borderRadius = "5px";
    document.body.appendChild(countdownDisplay);
}

function updateCountdown() {
    const minutes = Math.floor(countdownTime / 60);
    const seconds = countdownTime % 60;
    countdownDisplay.innerText = `Time Left: ${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

    if (countdownTime <= 0) {
        clearInterval(countdownInterval);
        showLosePopup();
    }
}

function startCountdown() {
    countdownTime = 120;
    updateCountdown();

    countdownInterval = setInterval(() => {
        if (!isPaused) {
            countdownTime--;
            updateCountdown();
            if (countdownTime <= 0) {
                clearInterval(countdownInterval);
                showLosePopup();
            }
        }
    }, 1000);
}

function pauseCountdown() {
    clearInterval(countdownInterval);
}

function resumeCountdown() {
    clearInterval(countdownInterval);
    countdownInterval = setInterval(() => {
        if (!isPaused) {
            countdownTime--;
            updateCountdown();
            if (countdownTime <= 0) {
                clearInterval(countdownInterval);
                showLosePopup();
            }
        }
    }, 1000);
}

function showWinPopup() {
    const popup = document.createElement("div");
    popup.classList.add("popup");
    popup.innerText = "YOU WIN!";
    document.body.appendChild(popup);
    const finalScore = countdownTime;

    pauseCountdown();
    setTimeout(() => {
        popup.style.opacity = 1;
    }, 100);
    setTimeout(() => {
        popup.style.opacity = 0;
        setTimeout(() => {
            document.body.removeChild(popup);
            promptForName(finalScore);
            document.querySelector("#game-menu h1").innerText = `Your Score: ${finalScore}!`;
        }, 300);
    }, 2000);
}

function promptForName(finalScore) {
    const namePrompt = document.createElement("div");
    namePrompt.classList.add("name-prompt");
    namePrompt.innerHTML = `
        <h2>Enter your name:</h2>
        <input type="text" id="player-name" placeholder="Your name">
        <button id="submit-name">Submit</button>
    `;
    document.body.appendChild(namePrompt);

    const submitButton = document.getElementById("submit-name");
    submitButton.addEventListener("click", () => {
        const playerName = document.getElementById("player-name").value.trim();
        if (playerName) {
            const scoreData = {
                name: playerName,
                score: finalScore,
            };

            fetch("/submit-score", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(scoreData),
            })
            .then(response => response.json())
            .then(data => {
                console.log("Score submitted successfully:", data);
                document.body.removeChild(namePrompt);
                resetGame();
            })
            .catch(error => {
                console.error("Error submitting score:", error);
                alert("There was an error submitting your score.");
            });
        } else {
            alert("Please enter a name.");
        }
    });
}


function updateLeaderboard(name, score) {
    const leaderboard = document.getElementById("leaderboard");
    if (!leaderboard) {
        const leaderboardContainer = document.createElement("div");
        leaderboardContainer.id = "leaderboard";
        document.body.appendChild(leaderboardContainer);
    }
    const playerScore = document.createElement("div");
    playerScore.classList.add("leaderboard-item");
    playerScore.innerText = `${name}: ${score}`;
    document.getElementById("leaderboard").appendChild(playerScore);
}

function showLosePopup() {
    const popup = document.createElement("div");
    popup.classList.add("popup");
    popup.innerText = "YOU LOSE!";
    document.body.appendChild(popup);
    pauseCountdown();
    setTimeout(() => {
        popup.style.opacity = 1;
    }, 100);
    setTimeout(() => {
        popup.style.opacity = 0;
        setTimeout(() => {
            document.body.removeChild(popup);
            resetGame();
        }, 300);
    }, 2000);
}

function removePlayer() {
    const player = document.getElementById("player");
    if (player) {
        player.remove();
    }
}

function gameLoop(timestamp) {
    if (!isPaused) {
        if (!lastMoveTime) lastMoveTime = timestamp;
        const deltaTime = timestamp - lastMoveTime;

        if (deltaTime > moveInterval) {
            window.characters.forEach(character => {
                window.moveCharacterRandomly(character);
            });
            lastMoveTime = timestamp;
        }
    }

    requestAnimationFrame(gameLoop);
}

function initPlayer() {
    const player = document.createElement("div")
    player.id = "player"

    let startX, startY
    do {
        startX = Math.floor(window.columns / 2)
        startY = Math.floor(window.rows / 2)
    } while (!window.isValidMove(startX, startY))

    console.log("Player Start Position:", startX, startY)

    updatePlayerPosition(player, startX, startY)

    window.tilemapContainer.appendChild(player)
    player.dataset.x = startX
    player.dataset.y = startY
}

function updatePlayerPosition(player, x, y) {
    const left = x * window.tileSize + window.tileSize / 2 - player.offsetWidth / 2
    const top = y * window.tileSize + window.tileSize / 2 - player.offsetHeight / 2
    player.style.left = `${left}px`
    player.style.top = `${top}px`
}

function movePlayer(e) {
    if (isPaused) return;

    const player = document.getElementById("player");
    const x = Number.parseInt(player.dataset.x, 10);
    const y = Number.parseInt(player.dataset.y, 10);

    let newX = x, newY = y;
    switch (e.key) {
        case "ArrowLeft":
            newX = x - 1;
            break;
        case "ArrowRight":
            newX = x + 1;
            break;
        case "ArrowUp":
            newY = y - 1;
            break;
        case "ArrowDown":
            newY = y + 1;
            break;
    }

    if (window.isValidMove(newX, newY)) {
        player.classList.add("moving");
        player.dataset.x = newX;
        player.dataset.y = newY;
        updatePlayerPosition(player, newX, newY);
        setTimeout(() => {
            player.classList.remove("moving");
        }, 400);

        if (window.winningCharacter &&
            newX === window.winningCharacter.position.x &&
            newY === window.winningCharacter.position.y) {

            showWinPopup();
            removeCharacter(window.winningCharacter);
            window.winningCharacter = null;
        }
        for (const character of window.characters) {
            if (newX === character.position.x && newY === character.position.y) {
                showLosePopup();
                removePlayer();
                return;
            }
        }
    }
}

function createPauseMenu() {
    pauseMenu = document.createElement("div")
    pauseMenu.classList.add("pause-menu")
    pauseMenu.style.display = "none"
    pauseMenu.innerHTML = `
        <div class="pause-content">
            <h2>Game Paused</h2>
            <button id="resumeButton">Resume</button>
        </div>
    `
    document.body.appendChild(pauseMenu)

    const resumeButton = document.getElementById("resumeButton")
    resumeButton.addEventListener("click", unpauseGame)
}

function showPauseMenu() {
    if (!gameStarted) return;
    if (!pauseMenu) {
        createPauseMenu()
    }
    pauseMenu.style.display = "flex"
    isPaused = true
}

function hidePauseMenu() {
    if (pauseMenu) {
        pauseMenu.style.display = "none"
    }
    isPaused = false
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
    pauseCountdown();
    showPauseMenu()
}

function unpauseGame() {
    hidePauseMenu();
    lastMoveTime = performance.now();
    requestAnimationFrame(gameLoop);
    resumeCountdown();
}

window.addEventListener("resize", () => {
    window.characters.forEach(window.updateCharacterPosition)
    updatePlayerPosition(
        document.getElementById("player"),
        Number.parseInt(document.getElementById("player").dataset.x, 10),
        Number.parseInt(document.getElementById("player").dataset.y, 10),
    )
})

window.addEventListener("keyup", movePlayer)
window.addEventListener("blur", pauseGame)
window.addEventListener("keyup", (e) => {
    if (e.key === "Escape") {
        togglePause()
    }
})

function initGame() {
    document.getElementById("game-menu").style.display = "none";
    gameStarted = true;
    initPlayer();
    window.initCharacter();
    createPauseMenu();
    createCountdownTimer();
    startCountdown();
    lastMoveTime = performance.now();
    requestAnimationFrame(gameLoop);
}
