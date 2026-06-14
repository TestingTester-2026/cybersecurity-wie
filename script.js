const questions = [
    {
        from: "security@microsoft.com",
        subject: "Unusual sign-in activity detected",
        detail: "Looks professional, logo present, redirects to account-microsoft-security.com",
        answer: "Scam"
    },
    {
        from: "support@googlemail.com",
        subject: "Your storage is almost full",
        detail: "Link: https://accounts.google.com/storage",
        answer: "Safe"
    },
    {
        from: "Verified Bank SMS Sender",
        subject: "Your KYC expires in 3 days.",
        detail: "Please update it through the official banking app. No links, no OTP requests.",
        answer: "Safe"
    },
    {
        from: "hr@careers-company.com",
        subject: "Congratulations! Internship Offer Letter",
        detail: "PDF attached, requests ₹500 document verification fee within 24 hours.",
        answer: "Scam"
    }
];

let currentQuestionIndex = 0;
let score = 0;

// DOM Elements
const startScreen = document.getElementById('start-screen');
const questionScreen = document.getElementById('question-screen');
const endScreen = document.getElementById('end-screen');
const startBtn = document.getElementById('start-btn');
const submitBtn = document.getElementById('submit-btn');
const restartBtn = document.getElementById('restart-btn');
const answerInput = document.getElementById('answer-input');
const feedbackMessage = document.getElementById('feedback-message');
const progressFill = document.getElementById('progress-fill');

// Question Display Elements
const qNumber = document.getElementById('q-number');
const qFrom = document.getElementById('q-from');
const qSubject = document.getElementById('q-subject');
const qDetail = document.getElementById('q-detail');
const finalScore = document.getElementById('final-score');
const evaluationText = document.getElementById('evaluation-text');

// Typewriter Utility Function for Scenario Details
function typeWriterEffect(element, text, speed = 15) {
    element.innerHTML = '';
    let i = 0;
    return new Promise(resolve => {
        function type() {
            if (i < text.length) {
                element.innerHTML += text.charAt(i);
                i++;
                setTimeout(type, speed);
            } else {
                resolve();
            }
        }
        type();
    });
}

// Event Listeners
startBtn.addEventListener('click', startGame);
submitBtn.addEventListener('click', checkAnswer);
restartBtn.addEventListener('click', resetGame);
answerInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') checkAnswer();
});

function startGame() {
    startScreen.classList.remove('active');
    questionScreen.classList.add('active');
    currentQuestionIndex = 0;
    score = 0;
    loadQuestion();
}

async function loadQuestion() {
    if (currentQuestionIndex >= questions.length) {
        endGame();
        return;
    }

    const q = questions[currentQuestionIndex];
    qNumber.textContent = `SYSTEM.SCENARIO[${currentQuestionIndex + 1}/${questions.length}]`;
    
    // Clear details first
    qFrom.textContent = '';
    qSubject.textContent = '';
    qDetail.textContent = '';
    
    answerInput.value = '';
    answerInput.disabled = true; // Disable until typing finishes
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.5';
    
    feedbackMessage.className = 'hidden';
    progressFill.style.width = `${((currentQuestionIndex) / questions.length) * 100}%`;

    // Type out the scenario
    await typeWriterEffect(qFrom, q.from);
    await typeWriterEffect(qSubject, q.subject);
    await typeWriterEffect(qDetail, q.detail);

    // Re-enable input
    answerInput.disabled = false;
    submitBtn.disabled = false;
    submitBtn.style.opacity = '1';
    answerInput.focus();
    
    submitBtn.querySelector('.btn-text').textContent = "EXECUTE_ANALYSIS";
    submitBtn.onclick = checkAnswer;
}

function checkAnswer() {
    if(answerInput.disabled) return;

    const userAnswer = answerInput.value.trim().toLowerCase();
    
    if (userAnswer !== 'safe' && userAnswer !== 'scam') {
        feedbackMessage.innerHTML = '> ERROR: INVALID_INPUT. MUST BE "SAFE" OR "SCAM".';
        feedbackMessage.className = 'feedback-wrong';
        return;
    }

    const q = questions[currentQuestionIndex];
    const isCorrect = userAnswer === q.answer.toLowerCase();

    feedbackMessage.className = isCorrect ? 'feedback-correct' : 'feedback-wrong';
    
    if (isCorrect) {
        feedbackMessage.innerHTML = `> ANALYSIS_CORRECT: TARGET IDENTIFIED AS [${q.answer.toUpperCase()}].`;
        score++;
    } else {
        feedbackMessage.innerHTML = `> CRITICAL_FAILURE: TARGET WAS ACTUALLY [${q.answer.toUpperCase()}].`;
        if(!isCorrect) document.querySelector('.cyber-card').style.borderColor = 'var(--error)';
    }

    answerInput.disabled = true;
    submitBtn.querySelector('.btn-text').textContent = "PROCEED_TO_NEXT";
    submitBtn.onclick = () => {
        document.querySelector('.cyber-card').style.borderColor = 'var(--brand-hover)';
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

function resetGame() {
    endScreen.classList.remove('active');
    startScreen.classList.add('active');
    
    // Retrigger animations by cloning and replacing start screen terminal box
    const box = document.querySelector('#start-screen .terminal-box');
    const newBox = box.cloneNode(true);
    box.parentNode.replaceChild(newBox, box);
}
