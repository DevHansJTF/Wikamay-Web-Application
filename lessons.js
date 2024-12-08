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
        fileExtension: 'png'
    },
    numbers: {
        title: 'numbers',
        headerImage: 'num_header.png',
        itemPrefix: 'Number',
        items: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
        imagePrefix: 'number',
        handPrefix: 'hand_number',
        videoPrefix: 'number_video',
        fileExtension: 'png'
    },
    emotions: {
        title: 'emotions',
        headerImage: 'emo_header.png',
        itemPrefix: 'Emotion',
        items: ['Happy', 'Angry', 'Love', 'Sad', 'Scared', 'Hungry', 'Sick', 'Worried'],
        imagePrefix: 'emotion',
        handPrefix: 'hand_emotion',
        videoPrefix: 'emotion_video',
        fileExtension: 'png'
    },   
    greetings: {
        title: 'greetings',
        headerImage: 'gre_header.png',
        itemPrefix: 'Greeting',
        items: ['Goodbye', 'Hello', 'Help', 'Nice to meet you', 'No', 'Please', 'Sorry', 'Thank you', 'Yes'],
        imagePrefix: 'greeting',
        handPrefix: 'hand_greeting',
        videoPrefix: 'greeting_video',
        fileExtension: 'gif'
    },
    animals: {
        title: 'animals',
        headerImage: 'ani_header.png',
        itemPrefix: 'Animal',
        items: ['Bear', 'Bird', 'Cat',  'Cow', 'Rabbit'],
        imagePrefix: 'animal',
        handPrefix: 'hand_animal',
        videoPrefix: 'animal_video',
        fileExtension: 'png'
    }
};
 
// State Management
const lessonState = {
    currentMode: 'learn',
    lessonType: localStorage.getItem('currentLesson') || 'alphabet',
    currentIndex: 0,
    isPlaying: false,
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
videoElement.controls = true; // Enable native controls
videoElement.style.display = 'none';
videoElement.preload = 'metadata'; // Preload video metadata

// Add video element to container
videoContainer.appendChild(videoElement);

// Initialize lesson
function initializeLesson() {
    // Set header image based on lesson type
    headerImage.src = `./images/${lessonState.config.headerImage}`;
    updateUI();
}
 
// Update UI based on current state
function updateUI() {
    const { config, currentItem } = lessonState;
 
    if (lessonState.currentMode === 'learn') {
        // Show learning mode, hide practice mode
        learnText.classList.remove('hidden');
        practiceText.classList.add('hidden');
        lessonIcon.classList.remove('hidden');
        practiceIcon.classList.add('hidden');
        videoView.classList.remove('hidden');
        practiceView.classList.add('hidden');
 
        // Update learning content
        learnText.innerHTML = `Let's learn the<br>${config.itemPrefix} ${currentItem}`;
        lessonIcon.src = `./images/${config.imagePrefix}_${currentItem.toLowerCase()}.${config.fileExtension}`;
        
        // Update video source
        videoElement.src = `./videos/${config.videoPrefix}_${currentItem.toLowerCase()}.mp4`;
        videoElement.style.display = 'block';
        lessonState.isPlaying = false;
    } else {
        // Show practice mode, hide learning mode
        learnText.classList.add('hidden');
        practiceText.classList.remove('hidden');
        lessonIcon.classList.add('hidden');
        practiceIcon.classList.remove('hidden');
        videoView.classList.add('hidden');
        practiceView.classList.remove('hidden');
 
        // Update practice content
        practiceIcon.src = `./images/${config.handPrefix}_${currentItem.toLowerCase()}.png`;
    }
 
    // Update navigation buttons visibility
    prevBtn.style.visibility = 
        lessonState.currentIndex === 0 && lessonState.currentMode === 'learn' 
            ? 'hidden' : 'visible';
    nextBtn.style.visibility = 
        lessonState.currentIndex === lessonState.config.items.length - 1 && lessonState.currentMode === 'practice' 
            ? 'hidden' : 'visible';
}

// Handle video events
videoElement.addEventListener('play', () => {
    lessonState.isPlaying = true;
});

videoElement.addEventListener('pause', () => {
    lessonState.isPlaying = false;
});

videoElement.addEventListener('ended', () => {
    lessonState.isPlaying = false;
    videoElement.currentTime = 0;
});

// Navigation handlers
function handleNext() {
    if (lessonState.currentMode === 'learn') {
        lessonState.currentMode = 'practice';
    } else {
        lessonState.currentMode = 'learn';
        lessonState.currentIndex++;
    }
    // Stop video if playing when navigating
    videoElement.pause();
    videoElement.currentTime = 0;
    updateUI();
}
 
function handlePrevious() {
    if (lessonState.currentMode === 'practice') {
        lessonState.currentMode = 'learn';
    } else {
        lessonState.currentIndex--;
        lessonState.currentMode = 'practice';
    }
    // Stop video if playing when navigating
    videoElement.pause();
    videoElement.currentTime = 0;
    updateUI();
}
 
// Return to lessons page
function handleReturn() {
    videoElement.pause();
    localStorage.removeItem('currentLesson');
    window.location.href = 'index.html';
}
 
// Event Listeners
nextBtn.addEventListener('click', handleNext);
prevBtn.addEventListener('click', handlePrevious);
returnBtn.addEventListener('click', handleReturn);
 
// Initialize the lesson when page loads
document.addEventListener('DOMContentLoaded', initializeLesson);