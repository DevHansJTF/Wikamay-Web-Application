// index.js
document.querySelector('.menu-item.alphabets').addEventListener('click', () => {
    localStorage.setItem('currentLesson', 'alphabet');
    window.location.href = 'lessons.html';
});

document.querySelector('.menu-item.numbers').addEventListener('click', () => {
    localStorage.setItem('currentLesson', 'numbers');
    window.location.href = 'lessons.html';
});

document.querySelector('.menu-item.emotions').addEventListener('click', () => {
    localStorage.setItem('currentLesson', 'emotions');
    window.location.href = 'lessons.html';
});

document.querySelector('.menu-item.greetings').addEventListener('click', () => {
    localStorage.setItem('currentLesson', 'greetings');
    window.location.href = 'lessons.html';
});

document.querySelector('.menu-item.animals').addEventListener('click', () => {
    localStorage.setItem('currentLesson', 'animals');
    window.location.href = 'lessons.html';
});