// Lesson Configurations
const lessonConfigs = {
    alphabet: {
        title: 'alphabet',
        headerImage: 'alph_header.png',
        itemPrefix: 'Letter',
        items: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 
                'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
        imagePrefix: 'letter',
        handPrefix: 'hand_letter'
    },
    numbers: {
        title: 'numbers',
        headerImage: 'num_header.png',
        itemPrefix: 'Number',
        items: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
        imagePrefix: 'number',
        handPrefix: 'hand_number'
    }
};

// State Management
const lessonState = {
    currentMode: 'learn',
    lessonType: localStorage.getItem('currentLesson') || 'alphabet',
    currentIndex: 0,
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
        lessonIcon.src = `./images/${config.imagePrefix}_${currentItem.toLowerCase()}.png`;
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

// Navigation handlers
function handleNext() {
    if (lessonState.currentMode === 'learn') {
        lessonState.currentMode = 'practice';
    } else {
        lessonState.currentMode = 'learn';
        lessonState.currentIndex++;
    }
    updateUI();
}

function handlePrevious() {
    if (lessonState.currentMode === 'practice') {
        lessonState.currentMode = 'learn';
    } else {
        lessonState.currentIndex--;
        lessonState.currentMode = 'practice';
    }
    updateUI();
}

// Return to lessons page
function handleReturn() {
    localStorage.removeItem('currentLesson');
    window.location.href = 'index.html';
}

// Event Listeners
nextBtn.addEventListener('click', handleNext);
prevBtn.addEventListener('click', handlePrevious);
returnBtn.addEventListener('click', handleReturn);

// Video player functionality (placeholder)
const playButton = document.querySelector('.lesson-play-btn');
playButton?.addEventListener('click', () => {
    console.log(`Play video for ${lessonState.config.itemPrefix} ${lessonState.currentItem}`);
});

// Camera functionality (placeholder)
function initializeCamera() {
    console.log(`Initialize camera for ${lessonState.config.itemPrefix} ${lessonState.currentItem}`);
}

// Initialize the lesson when page loads
document.addEventListener('DOMContentLoaded', initializeLesson);