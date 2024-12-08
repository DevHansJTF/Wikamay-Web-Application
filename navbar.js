// Add event listeners to navbar items
document.addEventListener('DOMContentLoaded', function() {
    // Get all nav items
    const navItems = document.querySelectorAll('.nav-item');
    
    // Add click event listeners to each nav item
    navItems.forEach(item => {
        const img = item.querySelector('img');
        if (img) {
            const imgSrc = img.getAttribute('src');
            
            item.addEventListener('click', () => {
                // Determine which page to navigate to based on the image source
                if (imgSrc.includes('learn.png')) {
                    window.location.href = 'index.html';
                } else if (imgSrc.includes('quiz.png')) {
                    window.location.href = 'quiz.html';
                } else if (imgSrc.includes('progress.png')) {
                    window.location.href = 'progress.html';
                }
            });
        }
    });
});