// Add these variables at the top - critical for prediction handling
let lastPredictionTime = 0;
const PREDICTION_COOLDOWN = 1500;

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
const styleSheet = document.createElement("style");
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);

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
            // Don't remove existing iframe if it exists
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
        
        // Only start recognition after iframe is fully loaded
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

    // Reset recognition state
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
            
            // Don't stop recognition, just pause briefly
            setTimeout(() => {
                showNextSign();
            }, 1500);
        }
    }
}


function stopRecognition() {
    // Only stop active recognition, don't remove iframe
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

// Modified skip button event listener
document.querySelector('.skip-btn').addEventListener('click', async () => {
    // Stop current recognition before skipping
    stopRecognition();
    
    // Wait briefly to ensure clean transition
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Show next sign
    showNextSign();
});


function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// Initialize game
async function initializeGame() {
    shuffleArray(gameState.currentSigns);
    
    // Initialize recognition first
    await initializeRecognition();
    
    // Then show first sign and start timer only after camera is ready
    showNextSign();
    
    // Start timer only after camera permission and initialization
    if (!gameState.timerInterval) {
        startTimer();
    }
}

// Show next sign
async function showNextSign() {
    // Only pause recognition briefly
    gameState.recognitionActive = false;

    // Brief pause for transition
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

    // Resume recognition after brief pause
    setTimeout(() => {
        gameState.recognitionActive = true;
        startRecognition();
    }, 500);
}

function cleanupGame() {
    if (recognitionIframe) {
        // Final cleanup of camera and iframe
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

    clearInterval(gameState.timerInterval);
    gameState.recognitionActive = false;
    recognitionInitialized = false;
}
// Modified return button handler
document.querySelector('.game-return-btn').addEventListener('click', () => {
    cleanupGame();
    window.location.href = 'quiz.html';
});
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

// Helper function
function isValidOrigin(origin) {
    return ['http://127.0.0.1:5000', 'http://127.0.0.1:5501'].includes(origin);
}

function startTimer() {
    const timerText = document.querySelector('.timer-text');
    
    gameState.timerInterval = setInterval(() => {
        gameState.timeLeft--;
        timerText.textContent = `${gameState.timeLeft} Seconds Left`;
        
        if (gameState.timeLeft <= 0) {
            cleanupGame();
            window.location.href = 'quiz.html';
        }
    }, 1000);
}

// Cleanup on page unload
window.addEventListener('beforeunload', cleanupGame);

// Initialize game when page loads
document.addEventListener('DOMContentLoaded', initializeGame);