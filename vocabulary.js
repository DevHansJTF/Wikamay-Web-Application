// Game State
const gameState = {
    timeLeft: 60,
    timerInterval: null,
    selectedItem: null,
    matchedPairs: 0,
    currentSet: [],
    itemSets: []
};

// Generate random sets of pairs (letters/numbers and their hand signs)
function generateItemSets() {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 
                    'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
    const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
    const allItems = [...letters, ...numbers];
    
    // Shuffle and create sets of 3 pairs (6 items total)
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
        // First selection
        gameState.selectedItem = item;
        item.classList.add('selected');
    } else if (gameState.selectedItem !== item) {
        // Second selection
        const firstItem = gameState.currentSet.find(i => i.id === gameState.selectedItem.dataset.id);
        const secondItem = gameState.currentSet.find(i => i.id === item.dataset.id);
        
        if (firstItem.match === secondItem.id) {
            // Match found
            gameState.selectedItem.classList.add('matched');
            item.classList.add('matched');
            gameState.matchedPairs++;
            
            if (gameState.matchedPairs === 3) {
                // All pairs matched, load next set
                setTimeout(loadNextSet, 500);
            }
        }
        
        // Reset selection
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
    // You can add score saving logic here
    setTimeout(() => {
        window.location.href = 'quiz.html';
    }, 1500);
}

// Initialize the game
function initializeGame() {
    gameState.itemSets = generateItemSets();
    loadNextSet();
    startTimer();
    
    // Add event listeners
    document.querySelector('.matching-grid').addEventListener('click', handleItemClick);
    document.querySelector('.game-return-btn').addEventListener('click', () => {
        clearInterval(gameState.timerInterval);
        window.location.href = 'quiz.html';
    });
}

// Start game when document is ready
document.addEventListener('DOMContentLoaded', initializeGame);