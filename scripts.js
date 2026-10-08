document.addEventListener('DOMContentLoaded', function() {
    const hamburgerMenu = document.getElementById('hamburger-menu');
    const nav = document.querySelector('nav');

    hamburgerMenu.addEventListener('click', () => {
        nav.classList.toggle('open');
    });

    document.querySelectorAll('nav ul li a').forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const viewId = link.getAttribute('data-view');
            document.querySelector('.view.active').classList.remove('active');
            document.getElementById(`${viewId}-view`).classList.add('active');
            nav.classList.remove('open'); // Close the menu after navigation
        });
    });
});
