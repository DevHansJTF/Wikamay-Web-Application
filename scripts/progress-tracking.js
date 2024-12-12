// progress-tracking.js

const LESSONS_CONFIG = {
    alphabet: {
        title: 'Alphabets',
        icon: 'alph_menu.png',
        items: [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'],
        needsPractice: true,
        imagePrefix: 'letter'
    },
    numbers: {
        title: 'Numbers',
        icon: 'num_menu.png',
        items: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
        needsPractice: true,
        imagePrefix: 'number'
    },
    emotions: {
        title: 'Emotions',
        icon: 'emo_menu.png',
        items: ['Happy', 'Angry', 'Love', 'Sad', 'Scared', 'Hungry', 'Sick', 'Worried'],
        needsPractice: false,
        imagePrefix: 'emotion'
    },
    greetings: {
        title: 'Greetings',
        icon: 'gre_menu.png',
        items: ['Goodbye', 'Hello', 'Help', 'No', 'Please', 'Sorry', 'Yes'],
        needsPractice: false,
        imagePrefix: 'greeting'
    },
    animals: {
        title: 'Animals',
        icon: 'ani_menu.png',
        items: ['Bear', 'Bird', 'Cat', 'Cow', 'Rabbit'],
        needsPractice: false,
        imagePrefix: 'animal'
    }
};

// Helper function to get progress data from localStorage
function getProgressData() {
    const data = localStorage.getItem('lessonProgress');
    return data ? JSON.parse(data) : {};
}

// Helper function to save progress data to localStorage
function saveProgressData(data) {
    localStorage.setItem('lessonProgress', JSON.stringify(data));
}

// Check if a lesson item is complete
function isLessonComplete(lessonType, item) {
    const progressData = getProgressData();
    if (!progressData[lessonType] || !progressData[lessonType][item]) return false;

    const config = LESSONS_CONFIG[lessonType];
    if (config.needsPractice) {
        return progressData[lessonType][item].learned && 
               progressData[lessonType][item].practiced;
    }
    return progressData[lessonType][item].learned;
}

// Calculate progress percentage for a lesson type
function calculateProgress(lessonType) {
    const config = LESSONS_CONFIG[lessonType];
    if (!config) return 0;

    const progressData = getProgressData();
    if (!progressData[lessonType]) return 0;

    let completed = 0;
    config.items.forEach(item => {
        if (isLessonComplete(lessonType, item)) {
            completed++;
        }
    });

    return Math.round((completed / config.items.length) * 100);
}

// Update progress for a lesson item
function updateLessonProgress(lessonType, item, isLearnComplete, isPracticeComplete) {
    const progressData = getProgressData();
    
    // Initialize lesson type if it doesn't exist
    if (!progressData[lessonType]) {
        progressData[lessonType] = {};
    }
    
    // Initialize item if it doesn't exist
    if (!progressData[lessonType][item]) {
        progressData[lessonType][item] = {
            learned: false,
            practiced: false
        };
    }

    // Update learn status if provided
    if (typeof isLearnComplete === 'boolean') {
        progressData[lessonType][item].learned = isLearnComplete;
    }

    // Update practice status if provided and lesson needs practice
    if (typeof isPracticeComplete === 'boolean' && LESSONS_CONFIG[lessonType].needsPractice) {
        progressData[lessonType][item].practiced = isPracticeComplete;
    }

    // Save updated progress
    saveProgressData(progressData);

    // Update UI if on progress page
    if (window.location.pathname.includes('progress.html')) {
        updateProgressUI();
        if (document.querySelector('.progress-modal').classList.contains('show')) {
            showProgressDetails(lessonType);
        }
    }
}

// Update the progress page UI
function updateProgressUI() {
    const container = document.querySelector('.progress-container');
    if (!container) return;

    container.innerHTML = '';

    Object.keys(LESSONS_CONFIG).forEach(lessonType => {
        const progress = calculateProgress(lessonType);
        const config = LESSONS_CONFIG[lessonType];

        const progressItem = document.createElement('div');
        progressItem.className = 'progress-item';
        progressItem.innerHTML = `
            <div class="progress-icon">
                <img src="./images/${config.icon}" alt="${config.title}">
            </div>
            <div class="progress-content">
                <span class="progress-label">Your Progress:</span>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progress}%;"></div>
                </div>
            </div>
        `;

        progressItem.addEventListener('click', () => showProgressDetails(lessonType));
        container.appendChild(progressItem);
    });
}

// Show detailed progress in modal
function showProgressDetails(lessonType) {
    const modal = document.querySelector('.progress-modal');
    const config = LESSONS_CONFIG[lessonType];
    const progress = calculateProgress(lessonType);

    // Update modal header
    modal.querySelector('.modal-icon img').src = `./images/${config.icon}`;
    modal.querySelector('.progress-fill').style.width = `${progress}%`;

    // Update lesson grid
    const grid = modal.querySelector('.lesson-grid');
    grid.innerHTML = '';

    config.items.forEach(item => {
        const isComplete = isLessonComplete(lessonType, item);
        const iconElement = document.createElement('div');
        iconElement.className = `lesson-icon ${isComplete ? '' : 'lesson-incomplete'}`;
        
        const img = document.createElement('img');
        img.src = `./images/${config.imagePrefix}_${item.toLowerCase()}.png`;
        img.alt = item;
        
        iconElement.appendChild(img);
        grid.appendChild(iconElement);
    });

    modal.classList.add('show');
    document.querySelector('.modal-overlay').classList.add('show');
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    // Update progress UI
    updateProgressUI();

    // Set up modal close handlers
    const closeButton = document.querySelector('.close-button');
    const overlay = document.querySelector('.modal-overlay');
    
    if (closeButton && overlay) {
        const hideModal = () => {
            document.querySelector('.progress-modal').classList.remove('show');
            overlay.classList.remove('show');
        };

        closeButton.addEventListener('click', hideModal);
        overlay.addEventListener('click', hideModal);
    }
});

// Export functions for use in other files
window.progressTracking = {
    updateLessonProgress,
    calculateProgress,
    isLessonComplete
};