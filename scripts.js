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

    populateBrowseView();
});

function populateBrowseView() {
    const browseView = document.getElementById('katakana-browse-view');
    if (!katakana) return;

    // Group by row_type
    const rows = {};
    katakana.forEach(item => {
        if (!rows[item.row_type]) {
            rows[item.row_type] = [];
        }
        rows[item.row_type].push(item);
    });

    // Create elements for each row
    for (const rowType in rows) {
        const rowElement = document.createElement('div');
        rowElement.className = 'kana-row';

        const containerElement = document.createElement('div');
        containerElement.className = 'kana-card-container';

        rows[rowType].forEach(item => {
            const card = document.createElement('div');
            card.className = 'kana-card';

            const leftHalf = document.createElement('div');
            leftHalf.className = 'kana-half kana-side';
            leftHalf.textContent = item.kana;

            const rightHalf = document.createElement('div');
            rightHalf.className = 'kana-half romaji-side';
            rightHalf.textContent = item.romaji;

            card.appendChild(leftHalf);
            card.appendChild(rightHalf);
            containerElement.appendChild(card);
        });

        rowElement.appendChild(containerElement);
        browseView.appendChild(rowElement);
    }
}
