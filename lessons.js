// State Management
const lessonState = {
    currentMode: 'learn', // 'learn' or 'practice'
    currentLetter: 'A',
    currentIndex: 0,
    letters: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 
              'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
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

// Update UI based on current state
function updateUI() {
    // Update visibility based on mode
    if (lessonState.currentMode === 'learn') {
        learnText.classList.remove('hidden');
        practiceText.classList.add('hidden');
        lessonIcon.classList.remove('hidden');
        practiceIcon.classList.add('hidden');
        videoView.classList.remove('hidden');
        practiceView.classList.add('hidden');
        learnText.textContent = `Let's learn the Letter ${lessonState.currentLetter}`;
        lessonIcon.src = `./images/letter_${lessonState.currentLetter.toLowerCase()}.png`;
    } else {
        learnText.classList.add('hidden');
        practiceText.classList.remove('hidden');
        lessonIcon.classList.add('hidden');
        practiceIcon.classList.remove('hidden');
        videoView.classList.add('hidden');
        practiceView.classList.remove('hidden');
        practiceIcon.src = `./images/hand_${lessonState.currentLetter.toLowerCase()}.png`;
    }

    // Update navigation buttons
    prevBtn.style.visibility = lessonState.currentIndex === 0 && lessonState.currentMode === 'learn' ? 'hidden' : 'visible';
    nextBtn.style.visibility = lessonState.currentIndex === lessonState.letters.length - 1 && lessonState.currentMode === 'practice' ? 'hidden' : 'visible';
}

// Navigation handlers
function handleNext() {
    if (lessonState.currentMode === 'learn') {
        // Switch to practice mode for current letter
        lessonState.currentMode = 'practice';
    } else {
        // Move to next letter in learn mode
        lessonState.currentMode = 'learn';
        lessonState.currentIndex++;
        lessonState.currentLetter = lessonState.letters[lessonState.currentIndex];
    }
    updateUI();
}

function handlePrevious() {
    if (lessonState.currentMode === 'practice') {
        // Switch back to learn mode for current letter
        lessonState.currentMode = 'learn';
    } else {
        // Move to previous letter's practice mode
        lessonState.currentIndex--;
        lessonState.currentLetter = lessonState.letters[lessonState.currentIndex];
        lessonState.currentMode = 'practice';
    }
    updateUI();
}

// Return to lessons page
function handleReturn() {
    window.location.href = 'index.html';
}

// Event Listeners
nextBtn.addEventListener('click', handleNext);
prevBtn.addEventListener('click', handlePrevious);
returnBtn.addEventListener('click', handleReturn);

// Video player functionality (placeholder)
const playButton = document.querySelector('.lesson-play-btn');
playButton?.addEventListener('click', () => {
    console.log('Play video for letter:', lessonState.currentLetter);
    // Add video player logic here
});

// Camera functionality (placeholder)
function initializeCamera() {
    console.log('Initialize camera for letter:', lessonState.currentLetter);
    // Add camera initialization logic here
}

// Initialize the UI
updateUI();