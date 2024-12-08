// index.js
document.querySelector('.menu-item.alphabets').addEventListener('click', () => {
    localStorage.setItem('currentLesson', 'alphabet');
    window.location.href = 'lessons.html';
});

document.querySelector('.menu-item.numbers').addEventListener('click', () => {
    localStorage.setItem('currentLesson', 'numbers');
    window.location.href = 'lessons.html';
});