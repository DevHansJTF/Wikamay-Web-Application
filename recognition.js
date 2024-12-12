// Add styles for score dialog
const dialogStyles = `
    .score-dialog-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }

    .score-dialog {
        background: white;
        border-radius: 24px;
        padding: 32px;
        width: 320px;
        text-align: center;
    }

    .score-title {
        color: #FFA500;
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 8px;
    }

    .score-value {
        color: #FFA500;
        font-size: 72px;
        font-weight: bold;
        margin-bottom: 32px;
    }

    .score-buttons {
        display: flex;
        flex-direction: column;
        gap: 16px;
        width: 100%;
    }

    .score-button {
        padding: 12px 24px;
        background: white;
        border: 2px solid #FFA500;
        border-radius: 9999px;
        color: #FFA500;
        font-weight: 600;
        cursor: pointer;
        transition: background-color 0.2s;
    }

    .score-button:hover {
        background: #FFF4E6;
    }
`;

const styleSheet = document.createElement("style");
styleSheet.textContent = dialogStyles;
document.head.appendChild(styleSheet);

const gameConfig = {
    letters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 
              'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
    numbers: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
    timeLimit: 60,
    optionsCount: 4
};

const gameState = {
    currentSign: null,
    signType: 'letter',
    timeLeft: gameConfig.timeLimit,
    score: 0,
    timerInterval: null,
    canProceed: true
};

function getRandomOptions(correctAnswer, signType) {
    const options = [correctAnswer];
    const signConfig = signType === 'letter' ? gameConfig.letters : gameConfig.numbers;
    while (options.length < gameConfig.optionsCount) {
        const randomSign = signConfig[Math.floor(Math.random() * signConfig.length)];
        if (!options.includes(randomSign)) {
            options.push(randomSign);
        }
    }
    return shuffle(options);
}
 
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

 
function updateGame() {
    if (!gameState.canProceed) return;
    
    gameState.signType = Math.random() < 0.5 ? 'letter' : 'number';
    const signList = gameState.signType === 'letter' ? gameConfig.letters : gameConfig.numbers;
    const currentSign = signList[Math.floor(Math.random() * signList.length)];
    gameState.currentSign = currentSign;
    
    const questionImg = document.querySelector('.hand-sign-img');
    if (gameState.signType === 'letter') {
        questionImg.src = `./images/hand_letter_${currentSign.toLowerCase()}.png`;
    } else {
        questionImg.src = `./images/hand_number_${currentSign}.png`;
    }
    
    const options = getRandomOptions(currentSign, gameState.signType);
    const optionImgs = document.querySelectorAll('.option-img');
    options.forEach((option, index) => {
        if (gameState.signType === 'letter') {
            optionImgs[index].src = `./images/letter_${option.toLowerCase()}.png`;
        } else {
            optionImgs[index].src = `./images/number_${option}.png`;
        }
        optionImgs[index].dataset.sign = option;
    });
    
    gameState.canProceed = false;
}
 
function handleOptionClick(event) {
    const selectedSign = event.target.dataset.sign;
    if (selectedSign === gameState.currentSign) {
        gameState.score++;
        gameState.canProceed = true;
        updateGame();
    }
}
 
function startTimer() {
    const timerText = document.querySelector('.timer-text');
    
    gameState.timerInterval = setInterval(() => {
        gameState.timeLeft--;
        timerText.textContent = `${gameState.timeLeft} Seconds Left`;
        
        if (gameState.timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}
 
function endGame() {
    clearInterval(gameState.timerInterval);
    
    const dialogHTML = `
        <div class="score-dialog-overlay">
            <div class="score-dialog">
                <div class="score-title">Your Final Score:</div>
                <div class="score-value">${gameState.score}</div>
                <div class="score-buttons">
                    <button class="score-button" id="returnToQuizzes">Return to Quizzes</button>
                    <button class="score-button" id="playAgain">Play Again</button>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', dialogHTML);
    
    document.getElementById('returnToQuizzes').addEventListener('click', () => {
        window.location.href = 'quiz.html';
    });
    
    document.getElementById('playAgain').addEventListener('click', () => {
        document.querySelector('.score-dialog-overlay').remove();
        
        // Reset game state
        gameState.timeLeft = gameConfig.timeLimit;
        gameState.score = 0;
        gameState.canProceed = true;
        
        // Update timer display
        document.querySelector('.timer-text').textContent = `${gameConfig.timeLimit} Seconds Left`;
        
        // Restart game
        updateGame();
        startTimer();
    });
}
 
function initializeGame() {
    gameState.canProceed = true;
    updateGame();
    startTimer();
    
    document.querySelectorAll('.option-img').forEach(option => {
        option.addEventListener('click', handleOptionClick);
    });
    
    document.querySelector('.skip-btn').addEventListener('click', () => {
        gameState.canProceed = true;
        updateGame();
    });
}

document.querySelector('.game-return-btn').addEventListener('click', () => {
    clearInterval(gameState.timerInterval);
    window.location.href = 'quiz.html';
});

document.addEventListener('DOMContentLoaded', initializeGame);