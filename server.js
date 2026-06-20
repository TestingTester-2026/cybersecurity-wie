const express = require('express');
const session = require('express-session');
const Database = require('better-sqlite3');
const path = require('path');
const {
    ROUND_1_ANSWERS,
    ROUND_2_ANSWERS,
    ROUND_3_PAIRS,
    ROUND_4_ANSWERS,
    ROUND_5_KEYWORDS
} = require('./answer-keys');

const app = express();
const PORT = 3000;

// ─── DATABASE SETUP ────────────────────────────────────────────────────────────
const db = new Database(path.join(__dirname, 'tournament.db'));
db.pragma('journal_mode = WAL');

db.exec(`
    CREATE TABLE IF NOT EXISTS teams (
        id                  INTEGER PRIMARY KEY AUTOINCREMENT,
        team_name           TEXT NOT NULL,
        registration_number TEXT UNIQUE NOT NULL,
        is_admin            INTEGER DEFAULT 0,
        round_1_score       INTEGER DEFAULT NULL,
        round_2_score       INTEGER DEFAULT NULL,
        round_3_score       INTEGER DEFAULT NULL,
        round_3_start_time  TEXT DEFAULT NULL,
        round_3_end_time    TEXT DEFAULT NULL,
        round_4_score       INTEGER DEFAULT NULL,
        round_5_score       INTEGER DEFAULT NULL
    );
`);

// Seed admin account if it doesn't exist
const adminExists = db.prepare('SELECT id FROM teams WHERE registration_number = ?').get('ADMIN-000');
if (!adminExists) {
    db.prepare('INSERT INTO teams (team_name, registration_number, is_admin) VALUES (?, ?, 1)')
      .run('ADMIN', 'ADMIN-000');
    console.log('✓ Admin account seeded (ADMIN / ADMIN-000)');
}

// Add new columns for registration and answer storage (fails silently if they already exist)
try { db.prepare('ALTER TABLE teams ADD COLUMN name TEXT DEFAULT NULL').run(); } catch(e) {}
try { db.prepare('ALTER TABLE teams ADD COLUMN round_1_answers TEXT DEFAULT NULL').run(); } catch(e) {}
try { db.prepare('ALTER TABLE teams ADD COLUMN round_2_answers TEXT DEFAULT NULL').run(); } catch(e) {}
try { db.prepare('ALTER TABLE teams ADD COLUMN round_3_answers TEXT DEFAULT NULL').run(); } catch(e) {}
try { db.prepare('ALTER TABLE teams ADD COLUMN round_4_answers TEXT DEFAULT NULL').run(); } catch(e) {}
try { db.prepare('ALTER TABLE teams ADD COLUMN round_5_answers TEXT DEFAULT NULL').run(); } catch(e) {}

// ─── MIDDLEWARE ─────────────────────────────────────────────────────────────────
app.use(express.json());
app.use(session({
    secret: 'ieee-wie-cyber-survival-2026-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 4, // 4 hours
        httpOnly: true,
        sameSite: 'lax'
    }
}));

// Auth middleware for protected routes
function requireAuth(req, res, next) {
    if (!req.session.teamId) {
        return res.status(401).json({ error: 'Not authenticated. Please login.' });
    }
    next();
}

// Serve static files (but block answer-keys.js and server.js)
app.use((req, res, next) => {
    const blocked = ['/answer-keys.js', '/server.js', '/tournament.db'];
    if (blocked.includes(req.path.toLowerCase())) {
        return res.status(403).json({ error: 'Access denied.' });
    }
    next();
});
app.use(express.static(path.join(__dirname)));

// ─── AUTH ENDPOINTS ─────────────────────────────────────────────────────────────

// POST /api/login
app.post('/api/login', (req, res) => {
    const { name, team_name, registration_number } = req.body;
    if (!name || !team_name || !registration_number) {
        return res.status(400).json({ error: 'Name, Team name, and registration number required.' });
    }

    let team = db.prepare('SELECT * FROM teams WHERE registration_number = ?').get(registration_number.trim());

    if (!team) {
        // Register new team
        const result = db.prepare('INSERT INTO teams (name, team_name, registration_number) VALUES (?, ?, ?)')
            .run(name.trim(), team_name.trim(), registration_number.trim());
        team = db.prepare('SELECT * FROM teams WHERE id = ?').get(result.lastInsertRowid);
    } else {
        // Verify team name
        if (team.team_name.toLowerCase() !== team_name.trim().toLowerCase()) {
            return res.status(401).json({ error: 'Invalid credentials. Team name does not match registration number.' });
        }
        // Could update the name if it was empty previously
        if (!team.name) {
            db.prepare('UPDATE teams SET name = ? WHERE id = ?').run(name.trim(), team.id);
            team.name = name.trim();
        }
    }

    // Set session
    req.session.teamId = team.id;
    req.session.teamName = team.team_name;
    req.session.isAdmin = !!team.is_admin;

    res.json({
        success: true,
        team_name: team.team_name,
        name: team.name,
        is_admin: !!team.is_admin
    });
});

// GET /api/session
app.get('/api/session', (req, res) => {
    if (!req.session.teamId) {
        return res.json({ authenticated: false });
    }

    const team = db.prepare('SELECT * FROM teams WHERE id = ?').get(req.session.teamId);
    if (!team) {
        return res.json({ authenticated: false });
    }

    res.json({
        authenticated: true,
        team_name: team.team_name,
        name: team.name,
        registration_number: team.registration_number,
        is_admin: !!team.is_admin,
        scores: {
            round_1: team.round_1_score,
            round_2: team.round_2_score,
            round_3: team.round_3_score,
            round_3_start_time: team.round_3_start_time,
            round_3_end_time: team.round_3_end_time,
            round_4: team.round_4_score,
            round_5: team.round_5_score
        }
    });
});

// POST /api/logout
app.post('/api/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

// ─── ROUND STATUS & CONTROL ────────────────────────────────────────────────────

// GET /api/round/:n/status
app.get('/api/round/:n/status', requireAuth, (req, res) => {
    const roundNum = parseInt(req.params.n);
    if (roundNum < 1 || roundNum > 5) {
        return res.status(400).json({ error: 'Invalid round number.' });
    }

    const team = db.prepare('SELECT * FROM teams WHERE id = ?').get(req.session.teamId);
    const scoreField = `round_${roundNum}_score`;
    const score = team[scoreField];
    const isAdmin = !!team.is_admin;

    const response = {
        round: roundNum,
        is_admin: isAdmin,
        completed: score !== null && !isAdmin,
        score: score
    };

    // Special handling for Round 3 timing
    if (roundNum === 3) {
        response.start_time = team.round_3_start_time;
        response.end_time = team.round_3_end_time;
    }

    res.json(response);
});

// POST /api/round/:n/start
app.post('/api/round/:n/start', requireAuth, (req, res) => {
    const roundNum = parseInt(req.params.n);
    if (roundNum < 1 || roundNum > 5) {
        return res.status(400).json({ error: 'Invalid round number.' });
    }

    const team = db.prepare('SELECT * FROM teams WHERE id = ?').get(req.session.teamId);
    const isAdmin = !!team.is_admin;

    // For non-admin: check if already completed
    if (!isAdmin) {
        const scoreField = `round_${roundNum}_score`;
        if (team[scoreField] !== null) {
            return res.status(403).json({ error: 'Round already completed.', completed: true });
        }
    }

    // Special handling: Round 3 start time
    if (roundNum === 3) {
        if (isAdmin) {
            // Admin: always reset the timer
            db.prepare('UPDATE teams SET round_3_start_time = ?, round_3_end_time = NULL, round_3_score = NULL WHERE id = ?')
              .run(new Date().toISOString(), team.id);
        } else if (!team.round_3_start_time) {
            // First start — set the timer
            db.prepare('UPDATE teams SET round_3_start_time = ? WHERE id = ?')
              .run(new Date().toISOString(), team.id);
        }
        // If start_time already set (mid-round refresh), don't reset it
    }

    res.json({ success: true, started: true });
});

// POST /api/round/:n/submit
app.post('/api/round/:n/submit', requireAuth, (req, res) => {
    const roundNum = parseInt(req.params.n);
    if (roundNum < 1 || roundNum > 5) {
        return res.status(400).json({ error: 'Invalid round number.' });
    }

    const team = db.prepare('SELECT * FROM teams WHERE id = ?').get(req.session.teamId);
    const isAdmin = !!team.is_admin;
    const scoreField = `round_${roundNum}_score`;

    // For non-admin: prevent re-submission
    if (!isAdmin && team[scoreField] !== null) {
        return res.status(403).json({ error: 'Round already completed. Score locked.', completed: true });
    }

    const { answers } = req.body;
    if (!answers) {
        return res.status(400).json({ error: 'No answers provided.' });
    }

    let computedScore = 0;

    switch (roundNum) {
        case 1:
            computedScore = computeRound1Score(answers);
            break;
        case 2:
            computedScore = computeRound2Score(answers);
            break;
        case 3:
            computedScore = computeRound3Score(answers, team, isAdmin);
            break;
        case 4:
            computedScore = computeRound4Score(answers);
            break;
        case 5:
            computedScore = computeRound5Score(answers);
            break;
    }

    // Save the score and answers
    if (!isAdmin) {
        const answersJson = JSON.stringify(answers);
        db.prepare(`UPDATE teams SET ${scoreField} = ?, round_${roundNum}_answers = ? WHERE id = ?`).run(computedScore, answersJson, team.id);

        // Round 3: also save end time
        if (roundNum === 3) {
            const endTime = new Date().toISOString();
            db.prepare('UPDATE teams SET round_3_end_time = ? WHERE id = ?').run(endTime, team.id);
        }
    }

    const response = { success: true, score: computedScore };

    // Include timing data for Round 3
    if (roundNum === 3) {
        const updatedTeam = db.prepare('SELECT round_3_start_time, round_3_end_time FROM teams WHERE id = ?').get(team.id);
        if (updatedTeam.round_3_start_time && updatedTeam.round_3_end_time) {
            const delta = new Date(updatedTeam.round_3_end_time) - new Date(updatedTeam.round_3_start_time);
            response.time_elapsed_ms = delta;
            response.time_elapsed_s = (delta / 1000).toFixed(2);
        }
    }

    res.json(response);
});

// ─── SCORING FUNCTIONS ──────────────────────────────────────────────────────────

function computeRound1Score(answers) {
    // answers: ["red light", "green light", ...]
    if (!Array.isArray(answers)) return 0;
    let score = 0;
    for (let i = 0; i < ROUND_1_ANSWERS.length; i++) {
        if (answers[i] && answers[i].toLowerCase().trim() === ROUND_1_ANSWERS[i]) {
            score++;
        }
    }
    return score;
}

function computeRound2Score(answers) {
    // answers: [1, 0, 1, 1] (selected option indices)
    if (!Array.isArray(answers)) return 0;
    let score = 0;
    for (let i = 0; i < ROUND_2_ANSWERS.length; i++) {
        if (answers[i] === ROUND_2_ANSWERS[i]) {
            score++;
        }
    }
    return score;
}

function computeRound3Score(answers, team, isAdmin) {
    // answers: { sets: [ { correctCount: 5, failedMatchIds: [] }, ... ] }
    if (!answers || !answers.sets || !Array.isArray(answers.sets)) return 0;

    let totalScore = 0;
    for (let i = 0; i < ROUND_3_PAIRS.length && i < answers.sets.length; i++) {
        const setData = answers.sets[i];
        const { multiplier, count } = ROUND_3_PAIRS[i];

        // Count correct first-try matches (not in failedMatchIds)
        const correctFirstTry = Math.min(setData.correctCount || 0, count);
        const failedCount = (setData.failedMatchIds && setData.failedMatchIds.length) || 0;

        // Points: only award for matches that were NOT failed
        const firstTryCorrect = Math.max(0, correctFirstTry - failedCount);
        totalScore += firstTryCorrect * multiplier;

        // Perfect Pull Bonus: only if zero failures in this set
        if (failedCount === 0 && correctFirstTry === count) {
            totalScore += 2;
        }
    }

    return totalScore;
}

function computeRound4Score(answers) {
    // answers: [1, 2, 1, 0] (selected option indices)
    if (!Array.isArray(answers)) return 0;
    let score = 0;
    for (let i = 0; i < ROUND_4_ANSWERS.length; i++) {
        if (answers[i] === ROUND_4_ANSWERS[i]) {
            score++;
        }
    }
    return score;
}

function computeRound5Score(answers) {
    // answers: ["some text answer", ...]
    if (!Array.isArray(answers)) return 0;
    let score = 0;
    for (let i = 0; i < ROUND_5_KEYWORDS.length; i++) {
        if (answers[i]) {
            const userAnswer = answers[i].toLowerCase().trim();
            for (const keyword of ROUND_5_KEYWORDS[i]) {
                if (userAnswer.includes(keyword)) {
                    score++;
                    break;
                }
            }
        }
    }
    return score;
}

// ─── START SERVER ───────────────────────────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`\n══════════════════════════════════════════════`);
    console.log(`  Cyber Odyssey Server`);
    console.log(`  Running on http://localhost:${PORT}`);
    console.log(`  Admin Login: ADMIN / ADMIN-000`);
    console.log(`══════════════════════════════════════════════\n`);
});
