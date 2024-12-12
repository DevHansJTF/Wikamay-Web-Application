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


// Lesson Configurations
const lessonConfigs = {
    alphabet: {
        title: 'alphabet',
        headerImage: 'alph_header.png',
        itemPrefix: 'Letter',
        items: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 
                'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
        imagePrefix: 'letter',
        handPrefix: 'hand_letter',
        videoPrefix: 'alphabet_video',
        fileExtension: 'png',
        hasPractice: true
    },
    numbers: {
        title: 'numbers',
        headerImage: 'num_header.png',
        itemPrefix: 'Number',
        items: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
        imagePrefix: 'number',
        handPrefix: 'hand_number',
        videoPrefix: 'number_video',
        fileExtension: 'png',
        hasPractice: true
    },
    emotions: {
        title: 'emotions',
        headerImage: 'emo_header.png',
        itemPrefix: 'Emotion',
        items: ['Happy', 'Angry', 'Love', 'Sad', 'Scared', 'Hungry', 'Sick', 'Worried'],
        imagePrefix: 'emotion',
        handPrefix: 'hand_emotion',
        videoPrefix: 'emotion_video',
        fileExtension: 'png',
        hasPractice: false
    },   
    greetings: {
        title: 'greetings',
        headerImage: 'gre_header.png',
        itemPrefix: 'Greeting',
        items: ['Goodbye', 'Hello', 'Help', 'No', 'Please', 'Sorry', 'Yes'],
        imagePrefix: 'greeting',
        handPrefix: 'hand_greeting',
        videoPrefix: 'greeting_video',
        fileExtension: 'gif',
        hasPractice: false
    },
    animals: {
        title: 'animals',
        headerImage: 'ani_header.png',
        itemPrefix: 'Animal',
        items: ['Bear', 'Bird', 'Cat', 'Cow', 'Rabbit'],
        imagePrefix: 'animal',
        handPrefix: 'hand_animal',
        videoPrefix: 'animal_video',
        fileExtension: 'png',
        hasPractice: false
    }
};
 
// State Management
const lessonState = {
    currentMode: 'learn',
    lessonType: localStorage.getItem('currentLesson') || 'alphabet',
    currentIndex: 0,
    isPlaying: false,
    recognitionActive: false,
    lastPredictionTime: 0,
    get currentItem() {
        return lessonConfigs[this.lessonType].items[this.currentIndex];
    },
    get config() {
        return lessonConfigs[this.lessonType];
    }
};


 
// DOM Elements
const learnText = document.getElementById('lesson-text');
const practiceText = document.getElementById('practice-text');
const lessonIcon = document.getElementById('lesson-icon');
const practiceIcon = document.getElementById('practice-icon');
const videoView = document.getElementById('lesson-video-view');
const practiceView = document.getElementById('lesson-practice-view');
const nextBtn = document.querySelector('.next-btn');
const prevBtn = document.querySelector('.prev-btn');
const returnBtn = document.querySelector('.lesson-return-btn');
const headerImage = document.querySelector('.lesson-title-img');
const videoContainer = document.querySelector('.lesson-video-container');

// Create video element with native controls
const videoElement = document.createElement('video');
videoElement.className = 'lesson-video';
videoElement.controls = true;
videoElement.style.display = 'none';
videoElement.preload = 'metadata';

// Add video element to container
videoContainer.appendChild(videoElement);

// Initialize lesson
function initializeLesson() {
    console.log('Initializing lesson...');
    headerImage.src = `./images/${lessonState.config.headerImage}`;
    updateUI();
}
 
// Update UI based on current state
function updateUI() {
    console.log('Updating UI, current state:', lessonState);
    const { config, currentItem } = lessonState;
    
    // Always show learn mode for lessons without practice
    if (!config.hasPractice) {
        lessonState.currentMode = 'learn';
    }
 
    if (lessonState.currentMode === 'learn') {
        learnText.classList.remove('hidden');
        practiceText.classList.add('hidden');
        lessonIcon.classList.remove('hidden');
        practiceIcon.classList.add('hidden');
        videoView.classList.remove('hidden');
        practiceView.classList.add('hidden');
 
        learnText.innerHTML = `Let's learn the<br>${config.itemPrefix} ${currentItem}`;
        lessonIcon.src = `./images/${config.imagePrefix}_${currentItem.toLowerCase()}.${config.fileExtension}`;
        
        videoElement.src = `./videos/${config.videoPrefix}_${currentItem.toLowerCase()}.mp4`;
        videoElement.style.display = 'block';
        lessonState.isPlaying = false;
    } else {
        learnText.classList.add('hidden');
        practiceText.classList.remove('hidden');
        lessonIcon.classList.add('hidden');
        practiceIcon.classList.remove('hidden');
        videoView.classList.add('hidden');
        practiceView.classList.remove('hidden');
 
        practiceIcon.src = `./images/${config.handPrefix}_${currentItem.toLowerCase()}.png`;
    }
 
    // Update navigation buttons visibility
    updateNavigationButtons();
}

function updateNavigationButtons() {
    const { config } = lessonState;
    const isLastItem = lessonState.currentIndex === config.items.length - 1;
    
    // Hide previous button on first item in learn mode
    prevBtn.style.visibility = 
        lessonState.currentIndex === 0 && lessonState.currentMode === 'learn' 
            ? 'hidden' : 'visible';
    
    // For lessons without practice
    if (!config.hasPractice) {
        nextBtn.style.visibility = isLastItem ? 'hidden' : 'visible';
        return;
    }
    
    // For lessons with practice
    nextBtn.style.visibility = 
        isLastItem && lessonState.currentMode === 'practice' 
            ? 'hidden' : 'visible';
}

// Handle video events
videoElement.addEventListener('play', () => {
    lessonState.isPlaying = true;
    console.log('Video started playing');
});

videoElement.addEventListener('pause', () => {
    lessonState.isPlaying = false;
    console.log('Video paused');
});

videoElement.addEventListener('ended', () => {
    lessonState.isPlaying = false;
    videoElement.currentTime = 0;
    console.log('Video ended');
    
    if (!lessonState.config.hasPractice) {
        // For lessons without practice, mark as complete
        progressTracking.updateLessonProgress(lessonState.lessonType, lessonState.currentItem, true);
    } else {
        // For lessons with practice, only mark lesson as complete
        progressTracking.updateLessonProgress(lessonState.lessonType, lessonState.currentItem, true, false);
    }
});


// Navigation handlers
function handleNext() {
    console.log('Handle next clicked. Current mode:', lessonState.currentMode);
    const { config } = lessonState;
    
    if (!config.hasPractice) {
        // For lessons without practice, simply move to next item
        lessonState.currentIndex++;
    } else {
        // For lessons with practice
        if (lessonState.currentMode === 'learn') {
            lessonState.currentMode = 'practice';
            showPracticeView();
        } else {
            lessonState.currentMode = 'learn';
            lessonState.currentIndex++;
            stopRecognition();
        }
    }
    updateUI();
}
 
function handlePrevious() {
    console.log('Handle previous clicked. Current mode:', lessonState.currentMode);
    const { config } = lessonState;
    
    if (!config.hasPractice) {
        // For lessons without practice, simply move to previous item
        lessonState.currentIndex--;
    } else {
        // For lessons with practice
        if (lessonState.currentMode === 'practice') {
            lessonState.currentMode = 'learn';
        } else {
            lessonState.currentIndex--;
            lessonState.currentMode = 'practice';
        }
    }
    
    videoElement.pause();
    videoElement.currentTime = 0;
    updateUI();
}

function handleReturn() {
    console.log('Returning to lessons page');
    videoElement.pause();
    localStorage.removeItem('currentLesson');
    window.location.href = 'index.html';
}

// Recognition handling
const errorContainer = document.createElement('div');
errorContainer.className = 'error-container';
errorContainer.style.display = 'none';
document.querySelector('.lesson-camera-container').appendChild(errorContainer);

// Modified Recognition handling
let recognitionIframe = null;
let recognitionInitialized = false;
let retryCount = 0;
const MAX_RETRIES = 3;

function showPracticeView() {
    if (!lessonState.config.hasPractice) return;
    
    console.log('Showing practice view...');
    document.getElementById('lesson-video-view').classList.add('hidden');
    document.getElementById('lesson-practice-view').classList.remove('hidden');
    document.getElementById('lesson-text').classList.add('hidden');
    document.getElementById('practice-text').classList.remove('hidden');
    document.getElementById('lesson-icon').classList.add('hidden');
    document.getElementById('practice-icon').classList.remove('hidden');
    
    if (!recognitionInitialized) {
        initializeRecognition();
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
                startRecognition();
                break;
            default:
                console.log('Unknown message type received:', type);
        }
    } catch (error) {
        console.error('Error handling iframe message:', error);
    }
}


async function initializeRecognition() {
    console.log('Setting up recognition iframe...');
    const cameraContainer = document.querySelector('.lesson-camera-container');
    
    try {
        // Clean up any existing iframe
        if (recognitionIframe) {
            recognitionIframe.remove();
            recognitionIframe = null;
        }

        // Create and setup iframe with required permissions
        recognitionIframe = document.createElement('iframe');
        recognitionIframe.src = 'http://127.0.0.1:5000/embed';
        recognitionIframe.style.width = '100%';
        recognitionIframe.style.height = '100%';
        recognitionIframe.style.border = 'none';
        recognitionIframe.style.borderRadius = '15px';
        recognitionIframe.allow = "camera *";
        
        // Set up load error handling
        recognitionIframe.onerror = (error) => {
            console.error('Iframe failed to load:', error);
            handleCameraError('Failed to load recognition system');
        };

        // Clear container and add iframe
        cameraContainer.innerHTML = '';
        cameraContainer.appendChild(recognitionIframe);

        // Set up message listener only once
        if (!window.recognitionMessageListener) {
            window.recognitionMessageListener = handleIframeMessage;
            window.addEventListener('message', handleIframeMessage);
        }

        recognitionInitialized = true;
        lessonState.recognitionActive = true;

        // Wait for iframe to load
        await new Promise((resolve) => {
            recognitionIframe.onload = resolve;
        });

        console.log('Recognition iframe loaded');
        startRecognition();

    } catch (error) {
        console.error('Error initializing recognition:', error);
        handleCameraError('Failed to initialize recognition system');
    }
}

function handlePrediction(data) {
    console.log('Received prediction:', data);
    
    if (!lessonState.recognitionActive) {
        console.log('Recognition not active, ignoring prediction');
        return;
    }
    
    const currentTime = Date.now();
    if (currentTime - lastPredictionTime < PREDICTION_COOLDOWN) {
        console.log('Prediction cooldown active, ignoring');
        return;
    }

    if (data.predicted_character) {
        console.log(`Predicted: ${data.predicted_character}, Target: ${lessonState.currentItem}`);
        
        let isMatch = false;
        if (lessonState.lessonType === 'numbers') {
            isMatch = parseInt(data.predicted_character) === parseInt(lessonState.currentItem);
        } else {
            isMatch = data.predicted_character.toUpperCase() === lessonState.currentItem.toUpperCase();
        }
        
        if (isMatch) {
            console.log('Correct prediction detected!');
            lastPredictionTime = currentTime;
            
            showSuccessNotification();
            
            // Update both lesson and practice completion
            progressTracking.updateLessonProgress(lessonState.lessonType, lessonState.currentItem, true, true);
            
            lessonState.recognitionActive = false;
            
            const isLastItem = lessonState.currentIndex === lessonState.config.items.length - 1;
            
            setTimeout(() => {
                if (isLastItem) {
                    console.log('Lesson completed, returning to main menu');
                    localStorage.removeItem('currentLesson');
                    window.location.href = 'index.html';
                } else {
                    console.log('Moving to next item...');
                    lessonState.currentMode = 'learn';
                    lessonState.currentIndex++;
                    stopRecognition();
                    updateUI();
                }
            }, 1500);
        }
    }
}

function showSuccessNotification() {
    const notification = document.createElement('div');
    notification.className = 'success-notification';
    notification.textContent = `Great job! You signed "${lessonState.currentItem}" correctly!`;
    
    const container = document.querySelector('.lesson-main-content');
    container.appendChild(notification);
    
    // Remove notification after animation
    setTimeout(() => {
        notification.remove();
    }, 1500);
}


function handleCameraError(error) {
    console.error('Camera error occurred:', error);
    
    const cameraContainer = document.querySelector('.lesson-camera-container');
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
    lessonState.recognitionActive = false;
}

async function retryRecognition() {
    if (retryCount >= MAX_RETRIES) {
        handleCameraError('Maximum retry attempts reached. Please refresh the page.');
        return;
    }

    retryCount++;
    recognitionInitialized = false;
    await initializeRecognition();
}

function startRecognition() {
    console.log('Starting recognition...');
    if (!recognitionIframe?.contentWindow) {
        console.error('Recognition iframe not ready');
        return;
    }

    lessonState.recognitionActive = true;
    lastPredictionTime = 0;

    // Determine model type based on lesson type
    const modelType = lessonState.lessonType === 'numbers' ? 'number' : 'alphabet';

    try {
        recognitionIframe.contentWindow.postMessage({
            type: 'START_RECOGNITION',
            data: {
                modelType: modelType,
                currentItem: lessonState.currentItem
            }
        }, 'http://127.0.0.1:5000');
        console.log(`Recognition started for ${lessonState.currentItem} using ${modelType} model`);
    } catch (error) {
        console.error('Error starting recognition:', error);
        handleCameraError('Failed to start recognition system');
    }
}


function stopRecognition() {
    lessonState.recognitionActive = false;

    if (recognitionIframe?.contentWindow) {
        try {
            recognitionIframe.contentWindow.postMessage({
                type: 'STOP_RECOGNITION'
            }, 'http://127.0.0.1:5000');
        } catch (error) {
            console.error('Error stopping recognition:', error);
        }
    }

    if (recognitionIframe) {
        recognitionIframe.remove();
        recognitionIframe = null;
    }

    if (window.recognitionMessageListener) {
        window.removeEventListener('message', window.recognitionMessageListener);
        window.recognitionMessageListener = null;
    }

    recognitionInitialized = false;
    retryCount = 0;
}

// Modified visibility handling
document.addEventListener('visibilitychange', () => {
    if (!lessonState.recognitionActive || !recognitionIframe?.contentWindow) return;

    try {
        recognitionIframe.contentWindow.postMessage({
            type: document.hidden ? 'PAUSE_RECOGNITION' : 'RESUME_RECOGNITION'
        }, 'http://127.0.0.1:5000');
    } catch (error) {
        console.error('Error handling visibility change:', error);
    }
});

// Helper Functions
function isValidOrigin(origin) {
    const allowedOrigins = ['http://127.0.0.1:5000', 'http://127.0.0.1:5501'];
    return allowedOrigins.includes(origin);
}

function updateRecognitionTarget() {
    if (recognitionIframe && recognitionIframe.contentWindow) {
        recognitionIframe.contentWindow.postMessage({
            type: 'UPDATE_TARGET',
            data: { target: lessonState.currentItem }
        }, 'http://127.0.0.1:5000');
    }
}

// Event Listeners
nextBtn.addEventListener('click', handleNext);
prevBtn.addEventListener('click', handlePrevious);
returnBtn.addEventListener('click', handleReturn);

// Cleanup function for page unload
window.addEventListener('beforeunload', () => {
    stopRecognition();
});

// Handle visibility change (tab switching)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log('Page hidden, pausing recognition');
        if (recognitionIframe) {
            recognitionIframe.contentWindow.postMessage({
                type: 'PAUSE_RECOGNITION'
            }, 'http://127.0.0.1:5000');
        }
    } else {
        console.log('Page visible, resuming recognition');
        if (recognitionIframe && lessonState.currentMode === 'practice') {
            recognitionIframe.contentWindow.postMessage({
                type: 'RESUME_RECOGNITION'
            }, 'http://127.0.0.1:5000');
        }
    }
});

// Error handling for iframe loading
window.addEventListener('error', (event) => {
    if (event.target.tagName === 'IFRAME') {
        console.error('Iframe failed to load:', event);
        handleCameraError('Failed to load recognition system');
    }
}, true);

// Initialize the lesson when page loads
document.addEventListener('DOMContentLoaded', initializeLesson);

// Export functions for testing if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        lessonState,
        initializeLesson,
        handleNext,
        handlePrevious,
        handleReturn,
        startRecognition,
        stopRecognition,
        handlePrediction,
        handleCameraError
    };
}