// scripts.js
document.getElementById('hamburgerMenu').addEventListener('click', function() {
    document.getElementById('sidebar').classList.toggle('hidden');
});

function showView(viewId) {
    // Hide all views
    const views = document.querySelectorAll('.view');
    views.forEach(view => view.classList.remove('visible'));

    // Show the selected view
    const viewToShow = document.getElementById(viewId);
    if (viewToShow) {
        viewToShow.classList.add('visible');
    }
}

// Initially show the welcome view
showView('welcome');
