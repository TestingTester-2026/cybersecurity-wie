const questions = [
    {
        title: "Set 1: Tech to Purpose",
        pairs: [
            { left: "Blockchain", right: "Transparent supply chains" },
            { left: "AI Translation", right: "Cross-cultural communication" },
            { left: "IoT Sensors", right: "Smart agriculture" },
            { left: "Digital Twin", right: "Disaster planning" },
            { left: "Computer Vision", right: "Assistive navigation for the visually impaired" }
        ]
    },
    {
        title: "Set 2: Hard - Tech to Purpose",
        pairs: [
            { left: "Federated Learning", right: "Privacy-preserving AI training" },
            { left: "Edge Computing", right: "Low-latency emergency response" },
            { left: "Explainable AI", right: "Transparent decision-making" },
            { left: "Generative AI", right: "Educational content creation" },
            { left: "Differential Privacy", right: "Data anonymization" }
        ]
    },
    {
        title: "Set 3: Very Hard - Problem to Tech",
        pairs: [
            { left: "Predicting floods", right: "Machine Learning" },
            { left: "Reducing food waste", right: "Predictive Analytics" },
            { left: "Teaching remote communities", right: "Satellite Internet" },
            { left: "Energy optimization", right: "Smart Grids" },
            { left: "Preserving endangered languages", right: "NLP" }
        ]
    },
    {
        title: "Set 4: Expert Level - Principle to Scenario",
        pairs: [
            { left: "Integrity", right: "Reporting an AI bias despite company pressure" },
            { left: "Inclusion", right: "Designing for differently abled users" },
            { left: "Responsibility", right: "Conducting safety testing before launch" },
            { left: "Sustainability", right: "Developing low-energy computing solutions" },
            { left: "Global Inspiration", right: "Open-sourcing educational tools" }
        ]
    }
];

// Game State
let currentQuestionIndex = 0;
let score = 0;
let startTime = 0;
let endTime = 0;
let leftSelected = null;
let rightSelected = null;
let currentLeftItems = [];
let currentRightItems = [];
let matchesMade = 0;
let failedMatches = new Set();

// DOM Elements
const startScreen = document.getElementById('start-screen');
const questionScreen = document.getElementById('question-screen');
const endScreen = document.getElementById('end-screen');
const startBtn = document.getElementById('start-btn');
const submitBtn = document.getElementById('submit-btn');
const colLeft = document.getElementById('col-left');
const colRight = document.getElementById('col-right');
const feedbackMessage = document.getElementById('feedback-message');
const progressFill = document.getElementById('progress-fill');
const finalScore = document.getElementById('final-score');
const evaluationText = document.getElementById('evaluation-text');

// Utility: Shuffle Array
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

startBtn.addEventListener('click', startGame);
submitBtn.addEventListener('click', nextSet);

function startGame() {
    startScreen.classList.remove('active');
    questionScreen.classList.add('active');
    currentQuestionIndex = 0;
    score = 0;
    startTime = Date.now();
    loadSet();
}

function loadSet() {
    if (currentQuestionIndex >= questions.length) {
        endGame();
        return;
    }

    const q = questions[currentQuestionIndex];
    document.getElementById('q-number').textContent = q.title;
    
    // Reset state
    leftSelected = null;
    rightSelected = null;
    matchesMade = 0;
    failedMatches = new Set();
    submitBtn.classList.add('hidden');
    feedbackMessage.className = 'hidden';
    document.querySelector('.cyber-card').style.borderColor = 'var(--border-color)';

    // Update progress bar
    const progressPercentage = (currentQuestionIndex / questions.length) * 100;
    progressFill.style.width = `${progressPercentage}%`;

    // Prepare shuffled arrays
    currentLeftItems = q.pairs.map((p, i) => ({ text: p.left, matchId: i }));
    currentRightItems = q.pairs.map((p, i) => ({ text: p.right, matchId: i }));
    
    shuffle(currentLeftItems);
    shuffle(currentRightItems);

    // Render Left
    colLeft.innerHTML = '';
    currentLeftItems.forEach((item, index) => {
        const btn = document.createElement('button');
        btn.className = 'match-btn';
        btn.textContent = item.text;
        btn.onclick = () => selectItem('left', btn, item.matchId);
        colLeft.appendChild(btn);
    });

    // Render Right
    colRight.innerHTML = '';
    currentRightItems.forEach((item, index) => {
        const btn = document.createElement('button');
        btn.className = 'match-btn';
        btn.textContent = item.text;
        btn.onclick = () => selectItem('right', btn, item.matchId);
        colRight.appendChild(btn);
    });
}

function selectItem(side, btn, matchId) {
    if (btn.classList.contains('matched')) return;

    // Remove previous selection on this side
    const parentCol = side === 'left' ? colLeft : colRight;
    parentCol.querySelectorAll('.match-btn').forEach(b => {
        if (!b.classList.contains('matched')) b.classList.remove('selected', 'error');
    });

    // Highlight new selection
    btn.classList.add('selected');

    if (side === 'left') {
        leftSelected = { btn, matchId };
    } else {
        rightSelected = { btn, matchId };
    }

    checkMatch();
}

function checkMatch() {
    if (leftSelected && rightSelected) {
        if (leftSelected.matchId === rightSelected.matchId) {
            // Match successful
            leftSelected.btn.classList.remove('selected');
            rightSelected.btn.classList.remove('selected');
            leftSelected.btn.classList.add('matched');
            rightSelected.btn.classList.add('matched');
            
            // Scoring Logic: Escalating Stakes Model
            let setMultiplier = currentQuestionIndex + 1;
            if (!failedMatches.has(leftSelected.matchId)) {
                score += setMultiplier;
            }
            
            feedbackMessage.classList.remove('hidden');
            feedbackMessage.className = 'feedback-correct';
            feedbackMessage.innerHTML = `> CONNECTION_ESTABLISHED. SECURE LINK CREATED.`;
            
            matchesMade++;
            
            if (matchesMade === questions[currentQuestionIndex].pairs.length) {
                // Set complete
                if (failedMatches.size === 0) {
                    score += 2; // Perfect Pull Bonus
                    feedbackMessage.innerHTML = `> SET_CLEARED. PERFECT PULL BONUS APPLIED [+2].`;
                } else {
                    feedbackMessage.innerHTML = `> SET_CLEARED. ALL PROTOCOLS ALIGNED.`;
                }
                document.querySelector('.cyber-card').style.borderColor = 'var(--success)';
                submitBtn.classList.remove('hidden');
            }
            
            leftSelected = null;
            rightSelected = null;
        } else {
            // Match failed
            failedMatches.add(leftSelected.matchId);
            failedMatches.add(rightSelected.matchId);

            leftSelected.btn.classList.add('error');
            rightSelected.btn.classList.add('error');
            
            feedbackMessage.classList.remove('hidden');
            feedbackMessage.className = 'feedback-wrong';
            feedbackMessage.innerHTML = `> CONNECTION_FAILED. MISMATCH DETECTED.`;

            // Reset after delay
            setTimeout(() => {
                if(leftSelected) leftSelected.btn.classList.remove('selected', 'error');
                if(rightSelected) rightSelected.btn.classList.remove('selected', 'error');
                leftSelected = null;
                rightSelected = null;
            }, 600);
        }
    }
}

function nextSet() {
    currentQuestionIndex++;
    loadSet();
}

function endGame() {
    endTime = Date.now();
    let timeElapsed = ((endTime - startTime) / 1000).toFixed(2);
    document.getElementById('time-elapsed').textContent = timeElapsed + 's';

    questionScreen.classList.remove('active');
    endScreen.classList.add('active');
    
    // Animate score counter
    let currentScore = 0;
    let stepTime = Math.max(20, Math.floor(1000 / Math.max(1, score)));
    const scoreInterval = setInterval(() => {
        if(currentScore >= score) {
            finalScore.textContent = score;
            clearInterval(scoreInterval);
            
            if(score === 58) {
                evaluationText.innerHTML = "> SYSTEM_EVALUATION: FLAWLESS EXECUTION. PERFECT PULLS ACHIEVED.";
                evaluationText.style.color = "var(--success)";
            } else if (score >= 40) {
                evaluationText.innerHTML = "> SYSTEM_EVALUATION: OUTSTANDING. SECURITY CLEARANCE GRANTED.";
                evaluationText.style.color = "var(--highlight)";
            } else if (score >= 20) {
                evaluationText.innerHTML = "> SYSTEM_EVALUATION: ACCEPTABLE. FURTHER TRAINING RECOMMENDED.";
                evaluationText.style.color = "var(--highlight)";
            } else {
                evaluationText.innerHTML = "> SYSTEM_EVALUATION: CRITICAL FAILURE. INSUFFICIENT SCORE.";
                evaluationText.style.color = "var(--error)";
            }
            return;
        }
        finalScore.textContent = currentScore;
        currentScore++;
    }, stepTime);
}
