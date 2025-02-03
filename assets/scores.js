let currentPage = 1;
const scoresPerPage = 5;

async function fetchScores(page = 1) {
    try {
        const response = await fetch(`/scores?page=${page}`);
        const data = await response.json();
        
        const scores = data.sort((a, b) => b.score - a.score); 
        displayLeaderboard(scores, page);
    } catch (error) {
        console.error("Error fetching scores:", error);
    }
}

function displayLeaderboard(scores, page) {
    const leaderboard = document.getElementById("leaderboard");
    const startIndex = (page - 1) * scoresPerPage;
    const endIndex = startIndex + scoresPerPage;
    const topScores = scores.slice(startIndex, endIndex);

    leaderboard.innerHTML = '';

    topScores.forEach(score => {
        const scoreElement = document.createElement("div");
        scoreElement.classList.add("leaderboard-item");
        scoreElement.innerText = `${score.name}: ${score.score}`;
        leaderboard.appendChild(scoreElement);
    });

    const prevButton = document.getElementById("prev-page");
    const nextButton = document.getElementById("next-page");

    prevButton.disabled = page === 1;
    nextButton.disabled = endIndex >= scores.length;

    prevButton.onclick = () => {
        if (page > 1) {
            fetchScores(page - 1);
            currentPage = page - 1;
        }
    };
    nextButton.onclick = () => {
        if (endIndex < scores.length) {
            fetchScores(page + 1);
            currentPage = page + 1;
        }
    };
}

window.fetchScores = fetchScores;
fetchScores(currentPage);