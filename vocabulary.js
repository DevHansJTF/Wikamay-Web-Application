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


// Game State
const gameState = {
    timeLeft: 60,
    timerInterval: null,
    selectedItem: null,
    matchedPairs: 0,
    totalPairs: 0,  // Track total pairs matched across all sets
    currentSet: [],
    itemSets: []
};

// Generate random sets of pairs (letters/numbers and their hand signs)
function generateItemSets() {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 
                    'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const allItems = [...letters, ...numbers];
    
    const shuffled = allItems.sort(() => Math.random() - 0.5);
    const sets = [];
    
    for (let i = 0; i < shuffled.length; i += 3) {
        if (i + 3 <= shuffled.length) {
            const currentItems = shuffled.slice(i, i + 3);
            const set = [];
            
            currentItems.forEach(item => {
                const isNumber = !isNaN(item);
                const prefix = isNumber ? 'number' : 'letter';
                set.push({
                    id: `${item}-1`,
                    image: `./images/${prefix}_${item.toLowerCase()}.png`,
                    match: `${item}-2`
                });
                set.push({
                    id: `${item}-2`,
                    image: `./images/hand_${prefix}_${item.toLowerCase()}.png`,
                    match: `${item}-1`
                });
            });
            
            sets.push(shuffle(set));
        }
    }
    
    return sets;
}

// Shuffle array helper function
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Update the grid with current set items
function updateGrid() {
    const grid = document.querySelector('.matching-grid');
    grid.innerHTML = '';
    
    gameState.currentSet.forEach(item => {
        const div = document.createElement('div');
        div.className = 'matching-item';
        div.dataset.id = item.id;
        
        const img = document.createElement('img');
        img.src = item.image;
        img.alt = 'Matching item';
        
        div.appendChild(img);
        grid.appendChild(div);
    });
}

// Handle item click events
function handleItemClick(event) {
    const item = event.target.closest('.matching-item');
    if (!item || item.classList.contains('matched')) return;
    
    if (!gameState.selectedItem) {
        gameState.selectedItem = item;
        item.classList.add('selected');
    } else if (gameState.selectedItem !== item) {
        const firstItem = gameState.currentSet.find(i => i.id === gameState.selectedItem.dataset.id);
        const secondItem = gameState.currentSet.find(i => i.id === item.dataset.id);
        
        if (firstItem.match === secondItem.id) {
            gameState.selectedItem.classList.add('matched');
            item.classList.add('matched');
            gameState.matchedPairs++;
            gameState.totalPairs++; // Increment total pairs count
            
            if (gameState.matchedPairs === 3) {
                setTimeout(loadNextSet, 500);
            }
        }
        
        gameState.selectedItem.classList.remove('selected');
        gameState.selectedItem = null;
    }
}


// Load next set of items
function loadNextSet() {
    if (gameState.itemSets.length === 0) {
        endGame();
        return;
    }
    
    gameState.currentSet = gameState.itemSets.pop();
    gameState.matchedPairs = 0;
    updateGrid();
}

// Start the game timer
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

// End game handling
function endGame() {
    clearInterval(gameState.timerInterval);
    
    const dialogHTML = `
        <div class="score-dialog-overlay">
            <div class="score-dialog">
                <div class="score-title">Your Final Score:</div>
                <div class="score-value">${gameState.totalPairs}</div>
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
        
        // Reset all game state
        gameState.timeLeft = 60;
        gameState.matchedPairs = 0;
        gameState.totalPairs = 0;  // Reset total pairs count
        gameState.selectedItem = null;
        gameState.itemSets = generateItemSets();
        
        document.querySelector('.timer-text').textContent = '60 Seconds Left';
        
        loadNextSet();
        startTimer();
    });
}

// Initialize the game
function initializeGame() {
    gameState.itemSets = generateItemSets();
    gameState.totalPairs = 0;  // Reset total pairs count on game start
    loadNextSet();
    startTimer();
    
    document.querySelector('.matching-grid').addEventListener('click', handleItemClick);
    document.querySelector('.game-return-btn').addEventListener('click', () => {
        clearInterval(gameState.timerInterval);
        window.location.href = 'quiz.html';
    });
}

document.addEventListener('DOMContentLoaded', initializeGame);