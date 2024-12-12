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

    const notificationStyles = `
        .success-notification {
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(46, 204, 113, 0.95);
            color: white;
            padding: 20px 40px;
            border-radius: 10px;
            font-size: 24px;
            font-weight: bold;
            z-index: 1000;
            animation: fadeInOut 1.5s ease-in-out;
            text-align: center;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        @keyframes fadeInOut {
            0% { opacity: 0; transform: translate(-50%, -30%); }
            15% { opacity: 1; transform: translate(-50%, -50%); }
            85% { opacity: 1; transform: translate(-50%, -50%); }
            100% { opacity: 0; transform: translate(-50%, -70%); }
        }
    `;

    // Create and append styles
    const notificationStyleSheet = document.createElement("style");
    notificationStyleSheet.textContent = notificationStyles;
    document.head.appendChild(notificationStyleSheet);

    // Game configurations
    const gameConfig = {
        letters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 
                'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
        numbers: ['1', '2', '3', '4', '5', '6', '7', '8', '9']
    };

    // Combine letters and numbers
    const allSigns = [
        ...gameConfig.letters.map(letter => ({ type: 'letter', value: letter })),
        ...gameConfig.numbers.map(number => ({ type: 'number', value: number }))
    ];

    // Game state
    const gameState = {
        currentSigns: [...allSigns],
        timeLeft: 60,
        timerInterval: null,
        currentSign: null,
        recognitionActive: false,
        score: 0,
        predictionsStarted: false
    };

    // Recognition handling
    let recognitionIframe = null;
    let recognitionInitialized = false;
    let retryCount = 0;
    const MAX_RETRIES = 3;
    let lastPredictionTime = 0;
    const PREDICTION_COOLDOWN = 1500;

    function showSuccessNotification() {
        const notification = document.createElement('div');
        notification.className = 'success-notification';
        notification.textContent = `Great job! You signed "${gameState.currentSign.value}" correctly!`;
        
        const container = document.querySelector('.camera-section');
        container.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 1500);
    }

    async function initializeRecognition() {
        console.log('Setting up recognition iframe...');
        const cameraContainer = document.querySelector('.camera-container');
        
        try {
            if (recognitionIframe) {
                return;
            }

            recognitionIframe = document.createElement('iframe');
            recognitionIframe.src = 'http://127.0.0.1:5000/embed';
            recognitionIframe.style.width = '100%';
            recognitionIframe.style.height = '100%';
            recognitionIframe.style.border = 'none';
            recognitionIframe.style.borderRadius = '15px';
            recognitionIframe.allow = "camera *";
            
            recognitionIframe.onerror = (error) => {
                console.error('Iframe failed to load:', error);
                handleCameraError('Failed to load recognition system');
            };

            cameraContainer.innerHTML = '';
            cameraContainer.appendChild(recognitionIframe);

            if (!window.recognitionMessageListener) {
                window.recognitionMessageListener = handleIframeMessage;
                window.addEventListener('message', handleIframeMessage);
            }

            recognitionInitialized = true;

            await new Promise((resolve) => {
                recognitionIframe.onload = resolve;
            });

            console.log('Recognition iframe loaded');
            
            setTimeout(() => {
                gameState.recognitionActive = true;
                startRecognition();
            }, 1000);

        } catch (error) {
            console.error('Error initializing recognition:', error);
            handleCameraError('Failed to initialize recognition system');
        }
    }

    function handleIframeMessage(event) {
        if (!isValidOrigin(event.origin)) {
            console.warn('Invalid origin:', event.origin);
            return;
        }

        try {
            const { type, data } = event.data;
            
            switch(type) {
                case 'PREDICTION_RESULT':
                    if (data) handlePrediction(data);
                    break;
                case 'CAMERA_ERROR':
                    handleCameraError(data?.error || 'Unknown camera error occurred');
                    break;
                case 'IFRAME_READY':
                    if (!gameState.predictionsStarted) {
                        startRecognition();
                        gameState.predictionsStarted = true;
                    }
                    break;
            }
        } catch (error) {
            console.error('Error handling iframe message:', error);
        }
    }

    function startRecognition() {
        if (!recognitionIframe?.contentWindow) {
            console.error('Recognition iframe not ready');
            return;
        }

        console.log('Starting recognition for:', gameState.currentSign);
        
        if (!gameState.currentSign) {
            console.error('No current sign set');
            return;
        }

        gameState.recognitionActive = true;
        lastPredictionTime = 0;

        const modelType = gameState.currentSign.type === 'number' ? 'number' : 'alphabet';

        try {
            recognitionIframe.contentWindow.postMessage({
                type: 'START_RECOGNITION',
                data: {
                    modelType: modelType,
                    currentItem: gameState.currentSign.value
                }
            }, 'http://127.0.0.1:5000');
            console.log(`Recognition started for ${gameState.currentSign.value} using ${modelType} model`);
        } catch (error) {
            console.error('Error starting recognition:', error);
            handleCameraError('Failed to start recognition system');
        }
    }

    function handlePrediction(data) {
        if (!gameState.recognitionActive || !gameState.currentSign) {
            return;
        }
        
        const currentTime = Date.now();
        if (currentTime - lastPredictionTime < PREDICTION_COOLDOWN) {
            return;
        }

        if (data.predicted_character) {
            console.log(`Comparing prediction ${data.predicted_character} with target ${gameState.currentSign.value}`);
            
            let isMatch = false;
            if (gameState.currentSign.type === 'number') {
                isMatch = parseInt(data.predicted_character) === parseInt(gameState.currentSign.value);
            } else {
                isMatch = data.predicted_character.toUpperCase() === gameState.currentSign.value.toUpperCase();
            }
            
            if (isMatch) {
                console.log('Correct prediction!');
                lastPredictionTime = currentTime;
                gameState.score++;
                
                showSuccessNotification();
                gameState.recognitionActive = false;
                
                setTimeout(() => {
                    showNextSign();
                }, 1500);
            }
        }
    }

    function stopRecognition() {
        gameState.recognitionActive = false;

        if (recognitionIframe?.contentWindow) {
            try {
                recognitionIframe.contentWindow.postMessage({
                    type: 'STOP_RECOGNITION'
                }, 'http://127.0.0.1:5000');
            } catch (error) {
                console.error('Error stopping recognition:', error);
            }
        }
    }

    document.querySelector('.skip-btn').addEventListener('click', async () => {
        stopRecognition();
        await new Promise(resolve => setTimeout(resolve, 300));
        showNextSign();
    });

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    async function initializeGame() {
        // Ensure clean state
        if (gameState.timerInterval) {
            clearInterval(gameState.timerInterval);
            gameState.timerInterval = null;
        }
        
        shuffleArray(gameState.currentSigns);
        await initializeRecognition();
        await showNextSign();
        
        // Start timer after everything is initialized
        startTimer();
    }

    async function showNextSign() {
        gameState.recognitionActive = false;
        await new Promise(resolve => setTimeout(resolve, 300));

        if (gameState.currentSigns.length === 0) {
            gameState.currentSigns = [...allSigns];
            shuffleArray(gameState.currentSigns);
        }

        gameState.currentSign = gameState.currentSigns.pop();
        const gameIcon = document.querySelector('.game-icon');
        
        if (gameState.currentSign.type === 'letter') {
            gameIcon.src = `./images/letter_${gameState.currentSign.value.toLowerCase()}.png`;
        } else {
            gameIcon.src = `./images/number_${gameState.currentSign.value}.png`;
        }
        gameIcon.alt = `${gameState.currentSign.type} ${gameState.currentSign.value}`;

        setTimeout(() => {
            gameState.recognitionActive = true;
            startRecognition();
        }, 500);
    }

    function cleanupGame() {
        // Stop the timer
        if (gameState.timerInterval) {
            clearInterval(gameState.timerInterval);
            gameState.timerInterval = null;
        }
    
        // Stop and cleanup recognition
        if (recognitionIframe) {
            if (recognitionIframe.contentWindow) {
                recognitionIframe.contentWindow.postMessage({
                    type: 'STOP_RECOGNITION'
                }, 'http://127.0.0.1:5000');
            }
            recognitionIframe.remove();
            recognitionIframe = null;
        }
    
        if (window.recognitionMessageListener) {
            window.removeEventListener('message', window.recognitionMessageListener);
            window.recognitionMessageListener = null;
        }
    
        gameState.recognitionActive = false;
        recognitionInitialized = false;
    }

    function handleCameraError(error) {
        console.error('Camera error occurred:', error);
        
        const cameraContainer = document.querySelector('.camera-container');
        if (!cameraContainer) return;

        const errorMessage = `
            <div class="error-message" style="color: white; text-align: center; padding: 20px;">
                <p>Error: ${error}</p>
                <p>Please ensure camera permissions are granted</p>
                <button onclick="retryRecognition()" 
                        style="padding: 8px 16px; margin-top: 10px; cursor: pointer; background: white; border: none; border-radius: 4px;">
                    Try Again
                </button>
            </div>
        `;

        cameraContainer.innerHTML = errorMessage;
        gameState.recognitionActive = false;
    }

    function isValidOrigin(origin) {
        return ['http://127.0.0.1:5000', 'http://127.0.0.1:5501'].includes(origin);
    }

    function startTimer() {
        if (gameState.timerInterval) {
            clearInterval(gameState.timerInterval); // Clear any existing timer
        }
        
        const timerText = document.querySelector('.timer-text');
        timerText.textContent = `${gameState.timeLeft} Seconds Left`;
        
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
        gameState.timerInterval = null;
        stopRecognition();
        
        // Update high score
        const isNewHighScore = quizProgress.updateHighScore('signrace', gameState.score);
        
        const dialogHTML = `
            <div class="score-dialog-overlay">
                <div class="score-dialog">
                    <div class="score-title">Your Final Score:</div>
                    <div class="score-value">${gameState.score}</div>
                    ${isNewHighScore ? '<div class="new-highscore">New High Score!</div>' : ''}
                    <div class="score-buttons">
                        <button class="score-button" id="returnToQuizzes">Return to Quizzes</button>
                        <button class="score-button" id="playAgain">Play Again</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.insertAdjacentHTML('beforeend', dialogHTML);
        
        document.getElementById('returnToQuizzes').addEventListener('click', () => {
            cleanupGame(); // Ensure cleanup happens before navigation
            window.location.href = 'quiz.html';
        });
        
        document.getElementById('playAgain').addEventListener('click', async () => {
            document.querySelector('.score-dialog-overlay').remove();
            
            // Cleanup old game state
            cleanupGame();
            
            // Reset game state
            gameState.timeLeft = 60;
            gameState.score = 0;
            gameState.recognitionActive = false;
            gameState.predictionsStarted = false;
            gameState.currentSigns = [...allSigns];
            shuffleArray(gameState.currentSigns);
            
            // Update timer display
            document.querySelector('.timer-text').textContent = '60 Seconds Left';
            
            // Reinitialize recognition and game
            recognitionInitialized = false; // Reset initialization flag
            recognitionIframe = null; // Reset iframe reference
            
            // Start new game
            await initializeGame();
        });
    }
    
    window.addEventListener('beforeunload', cleanupGame);

    document.addEventListener('DOMContentLoaded', initializeGame);

    // Add this event listener for the return button
document.querySelector('.game-return-btn').addEventListener('click', () => {
    cleanupGame(); // Ensure cleanup happens before navigation
    window.location.href = 'quiz.html';
});