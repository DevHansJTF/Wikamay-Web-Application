// Lesson configurations
const lessonConfigs = {
    alphabet: {
        title: 'Alphabets',
        icon: 'alph_menu.png',
        items: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 
                'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'],
        imagePrefix: 'letter',
        fileExtension: 'png',
        needsPractice: true
    },
    numbers: {
        title: 'Numbers',
        icon: 'num_menu.png',
        items: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
        imagePrefix: 'number',
        fileExtension: 'png',
        needsPractice: true
    },
    animals: {
        title: 'Animals',
        icon: 'ani_menu.png',
        items: ['Bear', 'Bird', 'Cat', 'Cow', 'Rabbit'],
        imagePrefix: 'animal',
        fileExtension: 'png',
        needsPractice: false
    },
    emotions: {
        title: 'Emotions',
        icon: 'emo_menu.png',
        items: ['Happy', 'Angry', 'Love', 'Sad', 'Scared', 'Hungry', 'Sick', 'Worried'],
        imagePrefix: 'emotion',
        fileExtension: 'png',
        needsPractice: false
    },
    greetings: {
        title: 'Greetings',
        icon: 'gre_menu.png',
        items: ['Goodbye', 'Hello', 'Help', 'No', 'Please', 'Sorry', 'Yes'],
        imagePrefix: 'greeting',
        fileExtension: 'gif',
        needsPractice: false
    }
};

// Create modal container
const modalHTML = `
    <div class="modal-overlay"></div>
    <div class="progress-modal">
        <div class="modal-header">
            <div class="modal-title">
                <div class="modal-icon">
                    <img src="" alt="Lesson Icon">
                </div>
                <div class="modal-progress-text">
                    <span class="modal-progress-label">Your Progress:</span>
                    <div class="progress-bar">
                        <div class="progress-fill"></div>
                    </div>
                </div>
            </div>
            <button class="close-button">
                <img src="./images/close.png" alt="Close">
            </button>
        </div>
        <div class="lesson-grid"></div>
    </div>
`;

document.body.insertAdjacentHTML('beforeend', modalHTML);

// Progress tracking functions
function getProgressData() {
    const storedData = localStorage.getItem('lessonProgress');
    return storedData ? JSON.parse(storedData) : {};
}

function saveProgressData(data) {
    localStorage.setItem('lessonProgress', JSON.stringify(data));
}

function isLessonComplete(lessonType, item) {
    const progressData = getProgressData();
    if (!progressData[lessonType]) return false;
    
    const lessonData = progressData[lessonType][item];
    if (!lessonData) return false;

    if (lessonConfigs[lessonType].needsPractice) {
        // For lessons with practice, both learn and practice must be completed
        return lessonData.learned === true && lessonData.practiced === true;
    } else {
        // For lessons without practice, only learn needs to be completed
        return lessonData.learned === true;
    }
}

function calculateProgress(lessonType) {
    const config = lessonConfigs[lessonType];
    const totalItems = config.items.length;
    let completedItems = 0;
    
    config.items.forEach(item => {
        if (isLessonComplete(lessonType, item)) {
            completedItems++;
        }
    });
    
    // Calculate percentage and round to 2 decimal places
    return Math.round((completedItems / totalItems) * 100);
}

function showModal(lessonType) {
    const config = lessonConfigs[lessonType];
    const progress = calculateProgress(lessonType);
    
    // Update modal content
    modal.querySelector('.modal-icon img').src = `./images/${config.icon}`;
    modal.querySelector('.progress-fill').style.width = `${progress}%`;
    
    // Update lesson grid
    const lessonGrid = modal.querySelector('.lesson-grid');
    lessonGrid.innerHTML = '';
    
    config.items.forEach(item => {
        const isComplete = isLessonComplete(lessonType, item);
        const lessonIcon = document.createElement('div');
        lessonIcon.className = `lesson-icon ${!isComplete ? 'lesson-incomplete' : ''}`;
        lessonIcon.innerHTML = `
            <img src="./images/${config.imagePrefix}_${item.toLowerCase().replace(/\s+/g, '')}.${config.fileExtension}" 
                 alt="${item}">
        `;
        lessonGrid.appendChild(lessonIcon);
    });
    
    modal.classList.add('show');
    overlay.classList.add('show');
}

function hideModal() {
    modal.classList.remove('show');
    overlay.classList.remove('show');
}

function createProgressItem(lessonType, config) {
    const progress = calculateProgress(lessonType);
    
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
    
    progressItem.addEventListener('click', () => showModal(lessonType));
    
    return progressItem;
}

function initializeProgress() {
    const container = document.querySelector('.progress-container');
    container.innerHTML = '';
    
    Object.entries(lessonConfigs).forEach(([lessonType, config]) => {
        const progressItem = createProgressItem(lessonType, config);
        container.appendChild(progressItem);
    });
}

function updateLessonProgress(lessonType, item, isLearnComplete, isPracticeComplete) {
    const progressData = getProgressData();
    
    // Initialize lesson type if doesn't exist
    if (!progressData[lessonType]) {
        progressData[lessonType] = {};
    }
    
    // Initialize lesson item if doesn't exist
    if (!progressData[lessonType][item]) {
        progressData[lessonType][item] = {
            learned: false,
            practiced: false
        };
    }
    
    // Update learn status if provided
    if (isLearnComplete !== undefined) {
        progressData[lessonType][item].learned = isLearnComplete;
    }
    
    // Update practice status if provided and lesson type needs practice
    if (isPracticeComplete !== undefined && lessonConfigs[lessonType].needsPractice) {
        progressData[lessonType][item].practiced = isPracticeComplete;
    }
    
    saveProgressData(progressData);
    
    // Refresh the UI
    initializeProgress();
    
    // If modal is open, refresh it
    if (modal.classList.contains('show')) {
        showModal(lessonType);
    }
}

// Modal handling
const modal = document.querySelector('.progress-modal');
const overlay = document.querySelector('.modal-overlay');
const closeButton = document.querySelector('.close-button');

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeProgress();
    
    // Close modal handlers
    closeButton.addEventListener('click', hideModal);
    overlay.addEventListener('click', hideModal);
    
    // Quiz progress button handler
    document.querySelector('.quiz-btn').addEventListener('click', () => {
        window.location.href = 'quizprogress.html';
    });
});

// Export functions for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        updateLessonProgress,
        isLessonComplete,
        calculateProgress
    };
}