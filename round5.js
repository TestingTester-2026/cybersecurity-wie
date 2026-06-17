const questions = [
    {
        scenario: "What is algorithmic bias?",
        keywords: ["unfair", "bias", "discrimination"],
        displayAnswer: "Systematic unfairness in AI decisions.",
        note: "Algorithmic bias occurs when a computer system reflects the implicit values of the humans who are involved in coding, collecting, selecting, or using data to train the algorithm."
    },
    {
        scenario: "What framework, adopted by the UN in 2021, provides global guidelines on ethical AI development by governments and companies?",
        keywords: ["unesco"],
        displayAnswer: "UNESCO Recommendation on the Ethics of Artificial Intelligence",
        note: "This is the first global standard-setting instrument on the ethics of AI, adopted by all 193 UNESCO Member States."
    },
    {
        scenario: "What is the term for the gap between populations who have meaningful access to digital technology and those who do not?",
        keywords: ["digital divide", "divide"],
        displayAnswer: "The Digital Divide",
        note: "The digital divide encompasses disparities in access to internet connectivity, hardware, and digital literacy."
    },
    {
        scenario: "A tech company's AI model performs well for majority groups but poorly for minorities. What type of failure is this?",
        keywords: ["bias", "algorithmic", "dataset", "data"],
        displayAnswer: "Algorithmic Bias / Dataset Bias",
        note: "When models are trained on unrepresentative data, they often fail dramatically on underrepresented groups, leading to discriminatory outcomes."
    }
];

// Game State
let currentQuestionIndex = 0;
let score = 0;

// DOM Elements
const startScreen = document.getElementById('start-screen');
const questionScreen = document.getElementById('question-screen');
const endScreen = document.getElementById('end-screen');
const startBtn = document.getElementById('start-btn');
const submitBtn = document.getElementById('submit-btn');
const answerInput = document.getElementById('answer-input');
const feedbackMessage = document.getElementById('feedback-message');
const developerNote = document.getElementById('developer-note');
const progressFill = document.getElementById('progress-fill');
const finalScore = document.getElementById('final-score');
const evaluationText = document.getElementById('evaluation-text');

// Event Listeners
startBtn.addEventListener('click', startGame);
submitBtn.addEventListener('click', () => {
    if (submitBtn.querySelector('.btn-text').textContent === "PROCEED_TO_NEXT") {
        nextQuestion();
    } else {
        checkAnswer();
    }
});
answerInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && submitBtn.querySelector('.btn-text').textContent === "EXECUTE_ANALYSIS") {
        checkAnswer();
    }
});

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
    document.getElementById('q-number').textContent = `Question ${currentQuestionIndex + 1}`;
    document.getElementById('q-scenario').textContent = q.scenario;
    
    // Reset state
    answerInput.value = '';
    answerInput.disabled = false;
    submitBtn.disabled = false;
    submitBtn.style.opacity = '1';
    submitBtn.querySelector('.btn-text').textContent = "EXECUTE_ANALYSIS";
    
    feedbackMessage.className = 'hidden';
    developerNote.className = 'hidden';
    document.querySelector('.cyber-card').style.borderColor = 'var(--border-color)';

    // Update progress bar
    const progressPercentage = (currentQuestionIndex / questions.length) * 100;
    progressFill.style.width = `${progressPercentage}%`;
    
    answerInput.focus();
}

function checkAnswer() {
    const userAnswer = answerInput.value.trim().toLowerCase();
    if (userAnswer === '') return;

    const q = questions[currentQuestionIndex];
    
    let isCorrect = false;
    for (let i = 0; i < q.keywords.length; i++) {
        if (userAnswer.includes(q.keywords[i])) {
            isCorrect = true;
            break;
        }
    }

    feedbackMessage.classList.remove('hidden');
    developerNote.classList.remove('hidden');
    
    answerInput.disabled = true;

    feedbackMessage.className = isCorrect ? 'feedback-correct' : 'feedback-wrong';
    
    if (isCorrect) {
        feedbackMessage.innerHTML = `> ANALYSIS_CORRECT. IDENTIFIED KEYWORDS.`;
        score++;
    } else {
        feedbackMessage.innerHTML = `> CRITICAL_FAILURE. EXPECTED: [${q.displayAnswer.toUpperCase()}]`;
        document.querySelector('.cyber-card').style.borderColor = 'var(--error)';
    }
    
    developerNote.innerHTML = `<strong>> DEV_NOTE:</strong> ${q.note}`;

    submitBtn.querySelector('.btn-text').textContent = "PROCEED_TO_NEXT";
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
