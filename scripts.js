// ── Current Kana Type ──
let currentKanaType = 'katakana';

function getData() {
    return currentKanaType === 'katakana' ? katakana : hiragana;
}

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

    // ── Introduction Modal ──
    const introModal = document.getElementById('intro-modal');

    document.getElementById('intro-modal-close').addEventListener('click', () => {
        introModal.classList.remove('open');
    });

    introModal.addEventListener('click', (e) => {
        if (e.target === introModal) {
            introModal.classList.remove('open');
        }
    });

    // ── Submenu Toggle ──
    const submenuRow = document.getElementById('submenu-row');

    document.querySelectorAll('.submenu-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.getAttribute('data-type');
            currentKanaType = type;

            // Update active state on buttons
            document.querySelectorAll('.submenu-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Switch to the matching view for the new kana type
            const activeView = document.querySelector('.view.active');
            if (activeView && activeView.id !== 'home-view') {
                const viewName = activeView.id.replace('-view', '');
                const oldPrefix = viewName.split('-')[0]; // e.g. 'katakana'
                if (oldPrefix !== type) {
                    activeView.classList.remove('active');
                    document.getElementById(`${type}-${viewName.substring(oldPrefix.length + 1)}-view`).classList.add('active');
                }

                if (viewName.endsWith('-browse')) {
                    populateBrowseView();
                } else if (viewName.endsWith('-quiz')) {
                    renderWelcomeStep();
                }
            }
        });
    });

    // ── Menu Navigation ──
    document.querySelectorAll('#menu-row a').forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const viewType = link.getAttribute('data-view');

            // Show submenu when navigating away from home
            if (viewType !== 'home') {
                submenuRow.classList.add('visible');
            }

            // Determine the full view ID based on current kana type
            const viewId = `${currentKanaType}-${viewType}`;

            document.querySelector('.view.active').classList.remove('active');
            document.getElementById(`${viewId}-view`).classList.add('active');

            // Initialize views
            if (viewType === 'browse') {
                populateBrowseView();
            } else if (viewType === 'quiz') {
                renderWelcomeStep();
            }
        });
    });
});

function showIntroModal() {
    const introModalBody = document.getElementById('intro-modal-body');
    const introModal = document.getElementById('intro-modal');

    introModalBody.innerHTML = `
        <p>Within both Hiragana and Katakana, characters are categorized into 
        functional subtypes based on how they alter pronunciation, represent syllable 
        structures, or serve specific grammatical rules.</p>

        <h3 style="color: #5DADE2;">Seion (清音) – "Clear Sounds"</h3>
        <p>These are the 46 foundational baseline characters of the Japanese alphabet. 
        They represent pure, unmodified syllables consisting of either a single vowel 
        (a, i, u, e, o), a consonant paired with a vowel (e.g., ka, mi, ru), or the 
        singular nasal consonant n (ん/ン).</p>

        <h3 style="color: #E97474;">Dakuon (濁音) – "Voiced Sounds"</h3>
        <p>These are variations of the baseline sounds created by adding a dakuten (゛), 
        a diacritic mark that looks like a double quotation mark. It converts unvoiced 
        consonants into voiced consonants. 
        K → G: か (ka) becomes が (ga), 
        S → Z: し (shi) becomes じ (ji), 
        T → D: た (ta) becomes だ (da), and
        H → B: は (ha) becomes ば (ba)</p>

        <h3 style="color: #F5B041;">Handakuon (半濁音) – "Semi-Voiced Sounds"</h3>
        <p>This subtype applies exclusively to the H-row characters. By adding a 
        handakuten (゜), which looks like a small circle, the breathy "H" sound is 
        transformed into a crisp plosive "P" sound. 
        H → P: は (ha) becomes ぱ (pa), 
        ひ (hi) becomes ぴ (pi), and 
        ふ (fu) becomes ぷ (pu).</p>

        <h3 style="color: #7DCEA0;">Yōon (拗音) – "Contracted / Blended Sounds"</h3>
        <p>Yōon characters represent compound syllables. They are formed by combining 
        a baseline character ending in an "i" sound (like ki, shi, chi, ni, mi, ri) with 
        a stunted, smaller version of ya, yu, or yo (ゃ/ゅ/ょ or ャ/ュ/ョ). They collapse 
        two characters into a single spoken syllable.</p>
    `;

    introModal.classList.add('open');
}

function populateBrowseView() {
    const browseView = document.getElementById(`${currentKanaType}-browse-view`);
    const data = getData();
    if (!data) return;

    browseView.innerHTML = '';

    // Introduction link at the top
    const introLink = document.createElement('div');
    introLink.className = 'intro-link';
    introLink.textContent = 'Introduction';
    introLink.addEventListener('click', showIntroModal);
    browseView.appendChild(introLink);

    // Group by row_type
    const rows = {};
    data.forEach(item => {
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
            if (item.type === 'yōon') {
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
        <div class="modal-type">Type: ${item.type}</div>
        ${wordsHtml}
    `;

    modal.classList.add('open');

    // Click a Japanese word to hear it spoken
    modalBody.querySelectorAll('.modal-word-kana').forEach(el => {
        el.addEventListener('click', () => speakJapanese(el.textContent));
    });
}

/* ── Speech Synthesis ── */

let japaneseVoice = null;

function loadJapaneseVoice() {
    const voices = speechSynthesis.getVoices();
    japaneseVoice = voices.find(v => v.lang.startsWith('ja')) || null;
}

// Voices load asynchronously on some browsers
speechSynthesis.onvoiceschanged = loadJapaneseVoice;
loadJapaneseVoice();

function speakJapanese(text) {
    if (!text) return;
    speechSynthesis.cancel(); // Stop any ongoing speech
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    if (japaneseVoice) {
        utterance.voice = japaneseVoice;
    }
    speechSynthesis.speak(utterance);
}

/* ── Quiz Logic ── */

const QUIZ_LENGTH = 10;
let quizState = {
    questions: [],
    currentStep: 0,
    score: 0,
    answered: false
};

// Flatten all words from every kana entry into one pool
function getAllWords() {
    const data = getData();
    const all = [];
    data.forEach(item => {
        if (item.words) {
            item.words.forEach(w => {
                all.push({ word: w.word, sv: w.sv, en: w.en });
            });
        }
    });
    return all;
}

function startQuiz(mode = 'jp-to-romaji') {
    const quizView = document.getElementById(`${currentKanaType}-quiz-view`);
    quizView.innerHTML = '';
    const data = getData();

    if (mode === 'jp-to-sv') {
        // Word-based quiz: Japanese word → Swedish translation
        const allWords = getAllWords();
        const shuffled = [...allWords].sort(() => Math.random() - 0.5);
        quizState.questions = shuffled.slice(0, QUIZ_LENGTH).map(item => {
            // Pick 2 wrong distractors from the remaining words
            const others = allWords.filter(w => w.word !== item.word);
            const distractors = others.sort(() => Math.random() - 0.5).slice(0, 2);
            const optionsList = [item, ...distractors].sort(() => Math.random() - 0.5);
            return {
                display: item.word,
                correct: item.sv,
                options: optionsList.map(o => o.sv)
            };
        });
    } else {
        // Original kana-based quiz modes
        const shuffled = [...data].sort(() => Math.random() - 0.5);
        quizState.questions = shuffled.slice(0, QUIZ_LENGTH).map(item => {
            // Pick 2 wrong distractors from the remaining items
            const others = data.filter(k => k.id !== item.id);
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
    }

    quizState.currentStep = 0;
    quizState.score = 0;
    quizState.answered = false;

    renderQuizStep();
}

function renderQuizStep() {
    const quizView = document.getElementById(`${currentKanaType}-quiz-view`);
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
    kanaDisplay.addEventListener('click', () => speakJapanese(question.display));
    container.appendChild(kanaDisplay);

    // Click-to-speak hint
    const speakHint = document.createElement('div');
    speakHint.id = 'quiz-speak-hint';
    speakHint.textContent = '🔊 Click the word to hear it';
    container.appendChild(speakHint);

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
        // Disable all buttons
        allButtons.forEach(btn => btn.classList.add('disabled'));
        // Auto-advance to next question after a short delay
        setTimeout(() => {
            quizState.currentStep++;
            if (quizState.currentStep < QUIZ_LENGTH) {
                quizState.answered = false;
                renderQuizStep();
            } else {
                renderScore();
            }
        }, 200);
    } else {
        clickedBtn.classList.add('wrong');
        // Highlight the correct answer in green
        allButtons.forEach(btn => {
            if (btn.textContent === correct) {
                btn.classList.add('correct');
            }
        });
        // Disable all buttons
        allButtons.forEach(btn => btn.classList.add('disabled'));
        // Show Next button only when wrong
        document.getElementById('quiz-next').style.display = 'inline-block';
    }
}

function renderScore() {
    const quizView = document.getElementById(`${currentKanaType}-quiz-view`);
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
    const quizView = document.getElementById(`${currentKanaType}-quiz-view`);
    quizView.innerHTML = '';

    const container = document.createElement('div');
    container.id = 'quiz-container';

    const optionsContainer = document.createElement('div');
    optionsContainer.id = 'quiz-options';

    // Mode 1: Kana --> Romaji
    const btn1 = document.createElement('button');
    btn1.className = 'quiz-option';
    btn1.textContent = 'Kana \u2192 Romaji';
    btn1.addEventListener('click', () => startQuiz('jp-to-romaji'));
    optionsContainer.appendChild(btn1);

    // Mode 2: Romaji --> Kana
    const btn2 = document.createElement('button');
    btn2.className = 'quiz-option';
    btn2.textContent = 'Romaji \u2192 Kana';
    btn2.addEventListener('click', () => startQuiz('romaji-to-jp'));
    optionsContainer.appendChild(btn2);

    // Mode 3: Japanese --> Swedish
    const btn3 = document.createElement('button');
    btn3.className = 'quiz-option';
    btn3.textContent = 'Japanese \u2192 Swedish';
    btn3.addEventListener('click', () => startQuiz('jp-to-sv'));
    optionsContainer.appendChild(btn3);

    container.appendChild(optionsContainer);

    quizView.appendChild(container);
}
