document.addEventListener('DOMContentLoaded', function() {
    const themeToggleBtn = document.getElementById('theme_toggle_btn');
    const themeIcon = themeToggleBtn ? themeToggleBtn.querySelector('.theme_icon') : null;

    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
        document.body.classList.add('dark_theme');
        if (themeIcon) themeIcon.textContent = '☀️';
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', function() {
            document.body.classList.toggle('dark_theme');
            const isDark = document.body.classList.contains('dark_theme');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
            if (themeIcon) {
                themeIcon.textContent = isDark ? '☀️' : '🌙';
            }
        });
    }
});