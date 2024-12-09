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
        questionImg.src = `./images/letter_${currentSign.toLowerCase()}.png`;
    } else {
        questionImg.src = `./images/number_${currentSign}.png`;
    }
    
    const options = getRandomOptions(currentSign, gameState.signType);
    const optionImgs = document.querySelectorAll('.option-img');
    options.forEach((option, index) => {
        if (gameState.signType === 'letter') {
            optionImgs[index].src = `./images/hand_letter_${option.toLowerCase()}.png`;
        } else {
            optionImgs[index].src = `./images/hand_number_${option}.png`;
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
            clearInterval(gameState.timerInterval);
            endGame();
        }
    }, 1000);
 }
 
 function endGame() {
    console.log(`Game Over! Score: ${gameState.score}`);
    // Add end game logic here
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