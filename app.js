document.addEventListener('DOMContentLoaded', () => {
    // === 1. TAB NAVIGATION ===
    const tabs = document.querySelectorAll('.nav-links li');
    const tabContents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active from all
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Add active to current
            tab.classList.add('active');
            const targetId = `tab-${tab.dataset.tab}`;
            document.getElementById(targetId).classList.add('active');
            
            // Re-initialize specific tab logic
            if(tab.dataset.tab === 'practice') {
                initPractice();
            } else if (tab.dataset.tab === 'quiz') {
                resetQuiz();
            }
        });
    });

    // === 2. LEARN TAB (FLASHCARDS) ===
    const flashcardContainer = document.getElementById('flashcard-container');
    const categoryFilter = document.getElementById('category-filter');

    function renderFlashcards(filter = 'all') {
        flashcardContainer.innerHTML = '';
        
        const filteredWords = filter === 'all' 
            ? hsk1_vocabulary 
            : hsk1_vocabulary.filter(word => word.category === filter);

        filteredWords.forEach(word => {
            const card = document.createElement('div');
            card.className = 'flashcard';
            card.innerHTML = `
                <div class="flashcard-inner">
                    <div class="flashcard-front">
                        <div class="hanzi">${word.hanzi}</div>
                    </div>
                    <div class="flashcard-back">
                        <div class="pinyin">${word.pinyin}</div>
                        <div class="meaning">${word.vi}</div>
                        <div class="example">${word.example}</div>
                    </div>
                </div>
            `;
            
            // Flip logic
            card.addEventListener('click', () => {
                card.classList.toggle('flipped');
            });

            flashcardContainer.appendChild(card);
        });
    }

    categoryFilter.addEventListener('change', (e) => {
        renderFlashcards(e.target.value);
    });

    // Initial render
    renderFlashcards();

    // === 3. PRACTICE TAB ===
    let practiceScore = 0;
    let currentPracticeWord = null;

    function initPractice() {
        practiceScore = 0;
        document.getElementById('practice-score').innerText = practiceScore;
        nextPracticeQuestion();
    }

    function nextPracticeQuestion() {
        document.getElementById('next-practice-btn').classList.add('hidden');
        
        // Pick random word
        const rIndex = Math.floor(Math.random() * hsk1_vocabulary.length);
        currentPracticeWord = hsk1_vocabulary[rIndex];
        
        document.getElementById('practice-question').innerText = currentPracticeWord.hanzi;

        // Generate options (1 correct, 3 wrong)
        const options = [currentPracticeWord];
        while(options.length < 4) {
            const randomOption = hsk1_vocabulary[Math.floor(Math.random() * hsk1_vocabulary.length)];
            if(!options.find(opt => opt.id === randomOption.id)) {
                options.push(randomOption);
            }
        }
        
        // Shuffle options
        options.sort(() => Math.random() - 0.5);
        
        const optionsContainer = document.getElementById('practice-options');
        optionsContainer.innerHTML = '';
        
        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.innerText = opt.vi;
            btn.addEventListener('click', () => checkPracticeAnswer(btn, opt.id));
            optionsContainer.appendChild(btn);
        });
    }

    function checkPracticeAnswer(btn, selectedId) {
        // Prevent clicking multiple times
        const allBtns = document.querySelectorAll('#practice-options .option-btn');
        allBtns.forEach(b => b.style.pointerEvents = 'none');

        if(selectedId === currentPracticeWord.id) {
            btn.classList.add('correct');
            practiceScore += 10;
            document.getElementById('practice-score').innerText = practiceScore;
        } else {
            btn.classList.add('wrong');
            // Highlight correct one
            allBtns.forEach(b => {
                if(b.innerText === currentPracticeWord.vi) {
                    b.classList.add('correct');
                }
            });
        }
        
        document.getElementById('next-practice-btn').classList.remove('hidden');
    }

    document.getElementById('next-practice-btn').addEventListener('click', nextPracticeQuestion);


    // === 4. QUIZ TAB ===
    let quizQuestions = [];
    let currentQuizIndex = 0;
    let quizScore = 0;
    const QUIZ_LENGTH = 20;

    const quizIntro = document.getElementById('quiz-intro');
    const quizActive = document.getElementById('quiz-active');
    const quizResult = document.getElementById('quiz-result');

    function resetQuiz() {
        quizIntro.classList.remove('hidden');
        quizActive.classList.add('hidden');
        quizResult.classList.add('hidden');
    }

    document.getElementById('start-quiz-btn').addEventListener('click', startQuiz);
    document.getElementById('restart-quiz-btn').addEventListener('click', startQuiz);

    function startQuiz() {
        quizIntro.classList.add('hidden');
        quizResult.classList.add('hidden');
        quizActive.classList.remove('hidden');
        
        quizScore = 0;
        currentQuizIndex = 0;
        
        // Generate 20 random questions
        const shuffled = [...hsk1_vocabulary].sort(() => 0.5 - Math.random());
        quizQuestions = shuffled.slice(0, QUIZ_LENGTH);
        
        showQuizQuestion();
    }

    function showQuizQuestion() {
        const qNum = currentQuizIndex + 1;
        document.getElementById('quiz-current-num').innerText = qNum;
        document.getElementById('quiz-progress-fill').style.width = `${(qNum / QUIZ_LENGTH) * 100}%`;

        const qWord = quizQuestions[currentQuizIndex];
        document.getElementById('quiz-question').innerText = qWord.hanzi;

        // Generate options
        const options = [qWord];
        while(options.length < 4) {
            const randomOption = hsk1_vocabulary[Math.floor(Math.random() * hsk1_vocabulary.length)];
            if(!options.find(opt => opt.id === randomOption.id)) {
                options.push(randomOption);
            }
        }
        options.sort(() => Math.random() - 0.5);

        const optionsContainer = document.getElementById('quiz-options');
        optionsContainer.innerHTML = '';
        
        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'option-btn';
            btn.innerText = opt.vi;
            btn.addEventListener('click', () => handleQuizAnswer(btn, opt.id, qWord.id));
            optionsContainer.appendChild(btn);
        });
    }

    function handleQuizAnswer(btn, selectedId, correctId) {
        const allBtns = document.querySelectorAll('#quiz-options .option-btn');
        allBtns.forEach(b => b.style.pointerEvents = 'none');

        if(selectedId === correctId) {
            btn.classList.add('correct');
            quizScore++;
        } else {
            btn.classList.add('wrong');
            allBtns.forEach(b => {
                if(b.innerText === quizQuestions[currentQuizIndex].vi) {
                    b.classList.add('correct');
                }
            });
        }

        setTimeout(() => {
            currentQuizIndex++;
            if(currentQuizIndex < QUIZ_LENGTH) {
                showQuizQuestion();
            } else {
                finishQuiz();
            }
        }, 1000);
    }

    function finishQuiz() {
        quizActive.classList.add('hidden');
        quizResult.classList.remove('hidden');
        
        const percentage = Math.round((quizScore / QUIZ_LENGTH) * 100);
        document.getElementById('quiz-final-score').innerText = `${percentage}%`;
        document.getElementById('quiz-result-msg').innerText = `Bạn đã trả lời đúng ${quizScore}/${QUIZ_LENGTH} câu.`;
        
        const titleEl = document.getElementById('quiz-result-title');
        if(percentage >= 80) {
            titleEl.innerText = "Xuất Sắc! 🎉";
            titleEl.style.color = "var(--success)";
        } else if(percentage >= 60) {
            titleEl.innerText = "Khá Tốt! 👍";
            titleEl.style.color = "var(--primary-color)";
        } else {
            titleEl.innerText = "Cố gắng lên! 💪";
            titleEl.style.color = "var(--danger)";
        }
    }
});
