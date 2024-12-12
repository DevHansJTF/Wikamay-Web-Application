// quiz-progress-tracking.js

// Configuration for games and achievements
const QUIZ_GAMES = {
    signrace: {
        title: 'ASL Sign Race',
        icon: 'race_menu.png',
        id: 'race'
    },
    vocabulary: {
        title: 'ASL Vocabulary',
        icon: 'vocab_menu.png',
        id: 'vocab'
    },
    recognition: {
        title: 'ASL Recognition',
        icon: 'reco_menu.png',
        id: 'recognition'
    }
};

const ACHIEVEMENTS = {
    low: {
        range: [0, 5],
        image: 'donut.png'
    },
    medium: {
        range: [6, 10],
        image: 'great_job.png'
    },
    high: {
        range: [11, Infinity],
        image: 'excellent.png'
    }
};

// Helper function to get high scores from localStorage
function getHighScores() {
    const scores = localStorage.getItem('quizHighScores');
    return scores ? JSON.parse(scores) : {};
}

// Helper function to save high scores to localStorage
function saveHighScores(scores) {
    localStorage.setItem('quizHighScores', JSON.stringify(scores));
}

// Update high score for a specific game
function updateHighScore(gameType, newScore) {
    const scores = getHighScores();
    const currentHighScore = scores[gameType] || 0;
    
    if (newScore > currentHighScore) {
        scores[gameType] = newScore;
        saveHighScores(scores);
        
        // Update UI if on quiz progress page
        if (window.location.pathname.includes('quizprogress.html')) {
            updateQuizProgressUI();
        }
        return true; // Indicates new high score was set
    }
    return false; // Indicates score was not high enough
}

// Get achievement image based on score
function getAchievementImage(score) {
    for (const [level, data] of Object.entries(ACHIEVEMENTS)) {
        if (score >= data.range[0] && score <= data.range[1]) {
            return data.image;
        }
    }
    return ACHIEVEMENTS.low.image; // Default achievement
}

// Update the quiz progress page UI
function updateQuizProgressUI() {
    const container = document.querySelector('.quiz-scores-container');
    if (!container) return;

    const scores = getHighScores();
    container.innerHTML = '';

    Object.entries(QUIZ_GAMES).forEach(([gameType, gameInfo]) => {
        const score = scores[gameType] || 0;
        const achievementImage = getAchievementImage(score);

        const scoreItem = document.createElement('div');
        scoreItem.className = 'score-item';
        scoreItem.innerHTML = `
            <div class="score-icon">
                <img src="./images/${gameInfo.icon}" alt="${gameInfo.title}">
            </div>
            <div class="score-content">
                <span class="score-label">Your Highscore:</span>
                <span class="score-value">${score}</span>
            </div>
            <div class="achievement-badge">
                <img src="./images/${achievementImage}" alt="Achievement Badge">
            </div>
        `;

        container.appendChild(scoreItem);
    });
}

// Initialize quiz progress tracking
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('quizprogress.html')) {
        updateQuizProgressUI();
    }
});

// Export functions for use in game files
window.quizProgress = {
    updateHighScore,
    getHighScores
};