let currentPage = 1;
const scoresPerPage = 5;

async function fetchScores(page = 1) {
    try {
        const response = await fetch(`/scores?page=${page}`, {
            headers: {
                "X-Requested-With": "XMLHttpRequest"
            }
        });
        const data = await response.json();
        console.log("Received scores data:", data);
        displayLeaderboard(data.scores, page, data.totalScores);
    } catch (error) {
        console.error("Error fetching scores:", error);
    }
}

function displayLeaderboard(scores, page, totalScores) {
    const leaderboard = document.getElementById("leaderboard");
    leaderboard.innerHTML = '';

    scores.forEach(score => {
        const scoreElement = document.createElement("div");
        scoreElement.classList.add("leaderboard-item");
        scoreElement.innerText = `${score.name}: ${score.score} (${score.timestamp})`;
        console.log(score.timestamp)
        leaderboard.appendChild(scoreElement);
    });

    const prevButton = document.getElementById("prev-page");
    const nextButton = document.getElementById("next-page");

    prevButton.disabled = page <= 1;
    nextButton.disabled = page >= Math.ceil(totalScores / scoresPerPage);

    prevButton.onclick = () => {
        if (page > 1) {
            currentPage = page - 1;
            fetchScores(currentPage);
        }
    };

    nextButton.onclick = () => {
        if (page < Math.ceil(totalScores / scoresPerPage)) {
            currentPage = page + 1;
            fetchScores(currentPage);
        }
    };
}

window.fetchScores = fetchScores;
fetchScores(currentPage);