const questions = [
    {
        from: "Development Team",
        subject: "Healthcare AI Tool Deployment",
        detail: "A healthcare AI tool flags a patient as 'low risk' for a serious condition. The development team knows the model was trained on a dataset underrepresenting women over 50. They ship the tool anyway to meet the launch deadline.",
        answer: "Red light"
    },
    {
        from: "Social Media Executive",
        subject: "Recommendation System Audit",
        detail: "A social media company learns its recommendation system promotes harmful misinformation but delays action because engagement is at an all-time high.",
        answer: "Red light"
    },
    {
        from: "University Admissions",
        subject: "AI Screening Deployment",
        detail: "A university uses AI to screen applications. Before deployment, it conducts fairness testing across gender, ethnicity, and socioeconomic groups.",
        answer: "Green light"
    },
    {
        from: "Fitness App Tracker",
        subject: "Data Monetization",
        detail: "A fitness app shares users' location history with advertisers without clearly informing users.",
        answer: "Red light"
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
const btnRedLight = document.getElementById('btn-red-light');
const btnGreenLight = document.getElementById('btn-green-light');
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
btnRedLight.addEventListener('click', () => checkAnswer('red light'));
btnGreenLight.addEventListener('click', () => checkAnswer('green light'));

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
    
    btnRedLight.disabled = true; // Disable until typing finishes
    btnGreenLight.disabled = true;
    btnRedLight.style.opacity = '0.5';
    btnGreenLight.style.opacity = '0.5';
    submitBtn.classList.add('hidden');
    
    feedbackMessage.className = 'hidden';
    progressFill.style.width = `${((currentQuestionIndex) / questions.length) * 100}%`;

    // Type out the scenario
    await typeWriterEffect(qFrom, q.from);
    await typeWriterEffect(qSubject, q.subject);
    await typeWriterEffect(qDetail, q.detail);

    // Re-enable input
    btnRedLight.disabled = false;
    btnGreenLight.disabled = false;
    btnRedLight.style.opacity = '1';
    btnGreenLight.style.opacity = '1';
}

function checkAnswer(userAnswer) {
    if(btnRedLight.disabled) return;

    const q = questions[currentQuestionIndex];
    const isCorrect = userAnswer === q.answer.toLowerCase();

    feedbackMessage.className = isCorrect ? 'feedback-correct' : 'feedback-wrong';
    feedbackMessage.classList.remove('hidden');
    
    if (isCorrect) {
        feedbackMessage.innerHTML = `> ANALYSIS_CORRECT: TARGET IDENTIFIED AS [${q.answer.toUpperCase()}].`;
        score++;
    } else {
        feedbackMessage.innerHTML = `> CRITICAL_FAILURE: TARGET WAS ACTUALLY [${q.answer.toUpperCase()}].`;
        if(!isCorrect) document.querySelector('.cyber-card').style.borderColor = 'var(--error)';
    }

    btnRedLight.disabled = true;
    btnGreenLight.disabled = true;
    btnRedLight.style.opacity = '0.5';
    btnGreenLight.style.opacity = '0.5';
    
    submitBtn.classList.remove('hidden');
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
