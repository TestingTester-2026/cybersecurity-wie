const questions = [
    {
        scenario: "Emoji Cipher: Identify the concept: ⚖️🤖💻",
        options: [
            "A) Data Privacy",
            "B) Algorithmic Fairness",
            "C) Malware",
            "D) Cloud Security"
        ],
        answer: 1, // B
        note: "The balance scale represents justice and fairness, the robot represents AI/algorithms, and the laptop represents computing."
    },
    {
        scenario: "ROT13 Cipher: Decode: VAGRTEVGL",
        options: [
            "A) Innovation",
            "B) Platform",
            "C) Integrity",
            "D) Governance"
        ],
        answer: 2, // C
        note: "Applying ROT13 (shifting letters by 13 places) to VAGRTEVGL yields INTEGRITY."
    },
    {
        scenario: "Riddle: 'Leaders promise me, users demand me, and regulators enforce me. Without me, trust collapses.'",
        options: [
            "A) Bandwidth",
            "B) Accountability",
            "C) Encryption",
            "D) Hardware"
        ],
        answer: 1, // B
        note: "Accountability is a core pillar of responsible AI, ensuring that someone is responsible for the impacts of AI systems."
    },
    {
        scenario: "Substitution Cipher: Each letter is replaced by the one directly opposite on a keyboard (Q↔P, W↔O, E↔I, R↔U, T↔Y). Decode: YUIRYQTIRSCE",
        options: [
            "A) TRANSPARENCY",
            "B) GOVERNANCE",
            "C) RESPONSIBLE",
            "D) INNOVATION"
        ],
        answer: 0, // A
        note: "Swapping the letters based on a standard QWERTY keyboard layout reveals the word TRANSPARENCY."
    }
];

// Game State
let currentQuestionIndex = 0;
let score = 0;
let selectedOptionIndex = -1;

// DOM Elements
const startScreen = document.getElementById('start-screen');
const questionScreen = document.getElementById('question-screen');
const endScreen = document.getElementById('end-screen');
const startBtn = document.getElementById('start-btn');
const submitBtn = document.getElementById('submit-btn');
const optionsContainer = document.getElementById('options-container');
const feedbackMessage = document.getElementById('feedback-message');
const developerNote = document.getElementById('developer-note');
const progressFill = document.getElementById('progress-fill');
const finalScore = document.getElementById('final-score');
const evaluationText = document.getElementById('evaluation-text');

// Event Listeners
startBtn.addEventListener('click', startGame);
submitBtn.addEventListener('click', checkAnswer);

function startGame() {
    startScreen.classList.remove('active');
    questionScreen.classList.add('active');
    currentQuestionIndex = 0;
    score = 0;
    loadQuestion();
}

function loadQuestion() {
    if (currentQuestionIndex >= questions.length) {
        endGame();
        return;
    }

    const q = questions[currentQuestionIndex];
    document.getElementById('q-number').textContent = `Puzzle ${currentQuestionIndex + 1}`;
    document.getElementById('q-scenario').textContent = q.scenario;
    
    // Reset state
    selectedOptionIndex = -1;
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.5';
    submitBtn.querySelector('.btn-text').textContent = "EXECUTE_ANALYSIS";
    submitBtn.onclick = checkAnswer;
    
    feedbackMessage.className = 'hidden';
    developerNote.className = 'hidden';
    document.querySelector('.cyber-card').style.borderColor = 'var(--border-color)';

    // Update progress bar
    const progressPercentage = (currentQuestionIndex / questions.length) * 100;
    progressFill.style.width = `${progressPercentage}%`;

    // Render options
    optionsContainer.innerHTML = '';
    q.options.forEach((opt, index) => {
        const btn = document.createElement('button');
        btn.className = 'mcq-option';
        btn.textContent = opt;
        btn.onclick = () => selectOption(index, btn);
        optionsContainer.appendChild(btn);
    });
}

function selectOption(index, btnElement) {
    if (submitBtn.querySelector('.btn-text').textContent === "PROCEED_TO_NEXT") return; // Already answered
    
    selectedOptionIndex = index;
    
    // Update visual selection
    document.querySelectorAll('.mcq-option').forEach(b => b.classList.remove('selected'));
    btnElement.classList.add('selected');
    
    // Enable submit
    submitBtn.disabled = false;
    submitBtn.style.opacity = '1';
}

function checkAnswer() {
    if (selectedOptionIndex === -1) return;

    const q = questions[currentQuestionIndex];
    const isCorrect = selectedOptionIndex === q.answer;

    feedbackMessage.classList.remove('hidden');
    developerNote.classList.remove('hidden');
    
    // Disable options
    document.querySelectorAll('.mcq-option').forEach((b, idx) => {
        b.style.pointerEvents = 'none';
        if (idx === q.answer) {
            b.style.borderColor = 'var(--success)';
            b.style.color = 'var(--success)';
        } else if (idx === selectedOptionIndex && !isCorrect) {
            b.style.borderColor = 'var(--error)';
            b.style.color = 'var(--error)';
        }
    });

    feedbackMessage.className = isCorrect ? 'feedback-correct' : 'feedback-wrong';
    
    if (isCorrect) {
        feedbackMessage.innerHTML = `> ANALYSIS_CORRECT. DECRYPTION SUCCESSFUL.`;
        score++;
    } else {
        feedbackMessage.innerHTML = `> CRITICAL_FAILURE. DECRYPTION FAILED.`;
        document.querySelector('.cyber-card').style.borderColor = 'var(--error)';
    }
    
    developerNote.innerHTML = `<strong>> DEV_NOTE:</strong> ${q.note}`;

    submitBtn.querySelector('.btn-text').textContent = "PROCEED_TO_NEXT";
    submitBtn.onclick = () => {
        nextQuestion();
    };
}

function nextQuestion() {
    currentQuestionIndex++;
    loadQuestion();
}

function endGame() {
    questionScreen.classList.remove('active');
    endScreen.classList.add('active');
    
    // Animate score counter
    let currentScore = 0;
    const scoreInterval = setInterval(() => {
        finalScore.textContent = currentScore;
        if(currentScore === score) {
            clearInterval(scoreInterval);
            
            // Evaluation text based on score
            if(score === 4) {
                evaluationText.innerHTML = "> SYSTEM_EVALUATION: FLAWLESS EXECUTION. SECURITY CLEARANCE GRANTED.";
                evaluationText.style.color = "var(--success)";
            } else if (score >= 2) {
                evaluationText.innerHTML = "> SYSTEM_EVALUATION: ACCEPTABLE. FURTHER TRAINING RECOMMENDED.";
                evaluationText.style.color = "var(--highlight)";
            } else {
                evaluationText.innerHTML = "> SYSTEM_EVALUATION: CRITICAL FAILURE. SECURITY BREACH IMMINENT.";
                evaluationText.style.color = "var(--error)";
            }
        }
        currentScore++;
    }, 200);
}
