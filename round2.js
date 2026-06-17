const questions = [
    {
        scenario: "The Cancer AI Dilemma: Deploy an AI that detects cancer with 99% accuracy but cannot explain its decisions, OR an AI with 94% accuracy whose decisions are fully explainable to doctors and patients.",
        options: [
            "Deploy 99% accurate (unexplainable) model",
            "Deploy 94% accurate (explainable) model"
        ],
        answer: 1, // Right bridge
        note: "In healthcare, explainability is crucial for doctor-patient trust, regulatory compliance, and identifying bias. Accuracy alone is insufficient if the clinical rationale is opaque."
    },
    {
        scenario: "The Disaster Prediction Dilemma: Release flood predictions immediately even though the model has a 20% false-alarm rate, OR delay release for additional verification, risking that some communities receive warnings too late.",
        options: [
            "Release immediately with 20% false-alarm rate",
            "Delay for verification"
        ],
        answer: 0, // Left bridge
        note: "In emergency scenarios, acting on imperfect information is often preferable to acting too late. The cost of a false alarm is far lower than the cost of missing a warning for a disaster."
    },
    {
        scenario: "The Accessibility Trade-Off: Develop one highly sophisticated educational platform for urban schools, OR a less advanced platform that can run on low-end devices in rural communities worldwide.",
        options: [
            "Sophisticated platform for urban schools",
            "Less advanced platform for low-end devices"
        ],
        answer: 1, // Right bridge
        note: "Tech equity prioritizes building solutions that bridge the digital divide. Designing for low-end constraints ensures broader, more inclusive access to educational resources."
    },
    {
        scenario: "The Bias Dilemma: Remove all demographic information from the dataset, OR collect demographic information with consent and use it to continuously audit fairness.",
        options: [
            "Remove all demographic information",
            "Collect demographic information with consent"
        ],
        answer: 1, // Right bridge
        note: "Being 'blind' to demographics makes it impossible to measure or fix bias. Collecting data securely with consent is necessary to actively audit and ensure equitable outcomes."
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
    document.getElementById('q-number').textContent = `Scenario ${currentQuestionIndex + 1}`;
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
        feedbackMessage.innerHTML = `> ANALYSIS_CORRECT. OPTION ACCEPTED.`;
        score++;
    } else {
        feedbackMessage.innerHTML = `> CRITICAL_FAILURE. INCORRECT DECISION.`;
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
