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

            // Initialize quiz when navigating to quiz view
            if (viewId === 'katakana-quiz') {
                startQuiz();
            }
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
            if (item.type === 'youon') {
                card.classList.add('kana-card--wide');
            }
            card.classList.add(`kana-card--${item.type}`);

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

/* ── Quiz Logic ── */

const QUIZ_LENGTH = 10;
let quizState = {
    questions: [],
    currentStep: 0,
    score: 0,
    answered: false
};

function startQuiz() {
    const quizView = document.getElementById('katakana-quiz-view');
    quizView.innerHTML = '';

    // Build a shuffled pool and pick QUIZ_LENGTH unique questions
    const shuffled = [...katakana].sort(() => Math.random() - 0.5);
    quizState.questions = shuffled.slice(0, QUIZ_LENGTH).map(item => {
        // Pick 2 wrong distractors from the remaining items
        const others = katakana.filter(k => k.id !== item.id);
        const distractors = others.sort(() => Math.random() - 0.5).slice(0, 2);
        const options = [item, ...distractors].sort(() => Math.random() - 0.5);
        return {
            kana: item.kana,
            correctRomaji: item.romaji,
            options: options.map(o => o.romaji)
        };
    });

    quizState.currentStep = 0;
    quizState.score = 0;
    quizState.answered = false;

    renderQuizStep();
}

function renderQuizStep() {
    const quizView = document.getElementById('katakana-quiz-view');
    quizView.innerHTML = '';

    const step = quizState.currentStep;
    const question = quizState.questions[step];

    // Container
    const container = document.createElement('div');
    container.id = 'quiz-container';

    // Progress
    const progress = document.createElement('div');
    progress.id = 'quiz-progress';
    progress.textContent = `Question ${step + 1} of ${QUIZ_LENGTH}`;
    container.appendChild(progress);

    // Kana character
    const kanaDisplay = document.createElement('div');
    kanaDisplay.id = 'quiz-kana';
    kanaDisplay.textContent = question.kana;
    container.appendChild(kanaDisplay);

    // Options
    const optionsContainer = document.createElement('div');
    optionsContainer.id = 'quiz-options';

    question.options.forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'quiz-option';
        btn.textContent = option;
        btn.addEventListener('click', () => handleAnswer(btn, option, question.correctRomaji, optionsContainer));
        optionsContainer.appendChild(btn);
    });

    container.appendChild(optionsContainer);

    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.id = 'quiz-next';
    nextBtn.textContent = step === QUIZ_LENGTH - 1 ? 'See Score' : 'Next';
    nextBtn.addEventListener('click', () => {
        quizState.currentStep++;
        if (quizState.currentStep < QUIZ_LENGTH) {
            quizState.answered = false;
            renderQuizStep();
        } else {
            renderScore();
        }
    });
    container.appendChild(nextBtn);

    quizView.appendChild(container);
    quizState.answered = false;
}

function handleAnswer(clickedBtn, selected, correct, optionsContainer) {
    if (quizState.answered) return;
    quizState.answered = true;

    const allButtons = optionsContainer.querySelectorAll('.quiz-option');

    if (selected === correct) {
        clickedBtn.classList.add('correct');
        quizState.score++;
    } else {
        clickedBtn.classList.add('wrong');
        // Highlight the correct answer in green
        allButtons.forEach(btn => {
            if (btn.textContent === correct) {
                btn.classList.add('correct');
            }
        });
    }

    // Disable all buttons
    allButtons.forEach(btn => btn.classList.add('disabled'));

    // Show Next button
    document.getElementById('quiz-next').style.display = 'inline-block';
}

function renderScore() {
    const quizView = document.getElementById('katakana-quiz-view');
    quizView.innerHTML = '';

    const container = document.createElement('div');
    container.id = 'quiz-container';

    const scoreDisplay = document.createElement('div');
    scoreDisplay.id = 'quiz-score';
    scoreDisplay.textContent = `${quizState.score} / ${QUIZ_LENGTH}`;
    container.appendChild(scoreDisplay);

    const restartBtn = document.createElement('button');
    restartBtn.id = 'quiz-restart';
    restartBtn.textContent = 'Try Again';
    restartBtn.addEventListener('click', startQuiz);
    container.appendChild(restartBtn);

    quizView.appendChild(container);
}
