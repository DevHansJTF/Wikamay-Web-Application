document.addEventListener('DOMContentLoaded', function() {
    // Lesson Progress Button (in quizprogress.html)
    const lessonProgressBtn = document.querySelector('.lesson-progress-btn');
    if (lessonProgressBtn) {
        lessonProgressBtn.addEventListener('click', () => {
            window.location.href = 'progress.html';
        });
    }
});