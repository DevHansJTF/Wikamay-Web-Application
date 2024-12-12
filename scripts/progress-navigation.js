document.addEventListener('DOMContentLoaded', function() {
    // Quiz Progress Button (in progress.html)
    const quizProgressBtn = document.querySelector('.quiz-progress-button');
    if (quizProgressBtn) {
        quizProgressBtn.addEventListener('click', () => {
            window.location.href = 'quizprogress.html';
        });
    }
});