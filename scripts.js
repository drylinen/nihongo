document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('kana-modal');

    // Close modal on button click
    document.getElementById('modal-close').addEventListener('click', () => {
        modal.classList.remove('open');
    });

    // Close modal on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('open');
        }
    });

    document.querySelectorAll('#menu-row a').forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const viewId = link.getAttribute('data-view');
            document.querySelector('.view.active').classList.remove('active');
            document.getElementById(`${viewId}-view`).classList.add('active');

            // Initialize quiz when navigating to quiz view
            if (viewId === 'katakana-quiz') {
                renderWelcomeStep();
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

            card.addEventListener('click', () => showKanaModal(item));

            containerElement.appendChild(card);
        });

        rowElement.appendChild(containerElement);
        browseView.appendChild(rowElement);
    }
}

function showKanaModal(item) {
    const modalBody = document.getElementById('modal-body');
    const modal = document.getElementById('kana-modal');

    // Build words HTML
    let wordsHtml = '';
    if (item.words && item.words.length > 0) {
        wordsHtml = `
            <div class="modal-words">
                <h3>Words</h3>
                ${item.words.map(w => `
                    <div class="modal-word-item">
                        <div class="modal-word-kana">${w.word}</div>
                        <div class="modal-word-en">${w.en}</div>
                        <div class="modal-word-sv">${w.sv}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    modalBody.innerHTML = `
        <div class="modal-kana">${item.kana}</div>
        <div class="modal-romaji">${item.romaji}</div>
        <div class="modal-type">${item.type}</div>
        ${wordsHtml}
    `;

    modal.classList.add('open');
}

/* ── Quiz Logic ── */

const QUIZ_LENGTH = 10;
let quizState = {
    questions: [],
    currentStep: 0,
    score: 0,
    answered: false
};

function startQuiz(mode = 'jp-to-romaji') {
    const quizView = document.getElementById('katakana-quiz-view');
    quizView.innerHTML = '';

    // Build a shuffled pool and pick QUIZ_LENGTH unique questions
    const shuffled = [...katakana].sort(() => Math.random() - 0.5);
    quizState.questions = shuffled.slice(0, QUIZ_LENGTH).map(item => {
        // Pick 2 wrong distractors from the remaining items
        const others = katakana.filter(k => k.id !== item.id);
        const distractors = others.sort(() => Math.random() - 0.5).slice(0, 2);
        const optionsList = [item, ...distractors].sort(() => Math.random() - 0.5);

        if (mode === 'jp-to-romaji') {
            return {
                display: item.kana,
                correct: item.romaji,
                options: optionsList.map(o => o.romaji)
            };
        } else {
            return {
                display: item.romaji,
                correct: item.kana,
                options: optionsList.map(o => o.kana)
            };
        }
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

    // Character display
    const kanaDisplay = document.createElement('div');
    kanaDisplay.id = 'quiz-kana';
    kanaDisplay.textContent = question.display;
    container.appendChild(kanaDisplay);

    // Options
    const optionsContainer = document.createElement('div');
    optionsContainer.id = 'quiz-options';

    question.options.forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'quiz-option';
        btn.textContent = option;
        btn.addEventListener('click', () => handleAnswer(btn, option, question.correct, optionsContainer));
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
    restartBtn.addEventListener('click', renderWelcomeStep);
    container.appendChild(restartBtn);

    quizView.appendChild(container);
}

function renderWelcomeStep() {
    const quizView = document.getElementById('katakana-quiz-view');
    quizView.innerHTML = '';

    const container = document.createElement('div');
    container.id = 'quiz-container';

    const welcomeText = document.createElement('h2');
    welcomeText.textContent = 'Welcome to the Katakana Quiz!';
    container.appendChild(welcomeText);

    const optionsContainer = document.createElement('div');
    optionsContainer.id = 'quiz-options';

    // Mode 1: Japanese --> Romaji
    const btn1 = document.createElement('button');
    btn1.className = 'quiz-option';
    btn1.textContent = 'Japanese \u2192 Romaji';
    btn1.addEventListener('click', () => startQuiz('jp-to-romaji'));
    optionsContainer.appendChild(btn1);

    // Mode 2: Romaji --> Japanese
    const btn2 = document.createElement('button');
    btn2.className = 'quiz-option';
    btn2.textContent = 'Romaji \u2192 Japanese';
    btn2.addEventListener('click', () => startQuiz('romaji-to-jp'));
    optionsContainer.appendChild(btn2);

    container.appendChild(optionsContainer);

    quizView.appendChild(container);
}
