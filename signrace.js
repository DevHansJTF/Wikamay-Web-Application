// Game configurations
const gameConfig = {
    letters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 
              'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
    numbers: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10']
};

// Combine letters and numbers
const allSigns = [
    ...gameConfig.letters.map(letter => ({ type: 'letter', value: letter })),
    ...gameConfig.numbers.map(number => ({ type: 'number', value: number }))
];

// Game state
const gameState = {
    currentSigns: [...allSigns],
    timeLeft: 60, // in seconds
    timerInterval: null
};

// Shuffle array function using Fisher-Yates algorithm
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Initialize game
function initializeGame() {
    shuffleArray(gameState.currentSigns);
    showNextSign();
    startTimer();
}

// Show next sign
function showNextSign() {
    if (gameState.currentSigns.length === 0) {
        gameState.currentSigns = [...allSigns];
        shuffleArray(gameState.currentSigns);
    }

    const nextSign = gameState.currentSigns.pop();
    const gameIcon = document.querySelector('.game-icon');
    
    // Update the image source based on sign type
    if (nextSign.type === 'letter') {
        gameIcon.src = `./images/letter_${nextSign.value.toLowerCase()}.png`;
    } else {
        gameIcon.src = `./images/number_${nextSign.value}.png`;
    }
    gameIcon.alt = `${nextSign.type} ${nextSign.value}`;
}

// Timer functionality
function startTimer() {
    const timerText = document.querySelector('.timer-text');
    
    gameState.timerInterval = setInterval(() => {
        gameState.timeLeft--;
        timerText.textContent = `${gameState.timeLeft} Seconds Left`;
        
        if (gameState.timeLeft <= 0) {
            clearInterval(gameState.timerInterval);
            endGame();
        }
    }, 1000);
}

// End game
function endGame() {
    // Add your end game logic here
    // For example, redirect to results page or show score
    console.log('Game Over!');
}

// Event listeners
document.querySelector('.skip-btn').addEventListener('click', showNextSign);

document.querySelector('.game-return-btn').addEventListener('click', () => {
    clearInterval(gameState.timerInterval);
    window.location.href = 'quiz.html';
});

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', initializeGame);