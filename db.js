/**
 * db.js — PostgreSQL adapter for Supabase
 *
 * Provides the same get / run / query interface as the former SQLite layer.
 * Column names are stored lowercase in PostgreSQL (unquoted) but camelCase
 * aliases are handled via a normaliser so service/controller code doesn't change.
 *
 * Placeholder translation: SQLite ? → PostgreSQL $1, $2, …
 */

require('dotenv').config();
const { Pool } = require('pg');
const bcrypt   = require('bcryptjs');

// ── Connection pool ──────────────────────────────────────────────────────────
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
});

pool.on('error', (err) => {
    console.error('❌  Unexpected PostgreSQL pool error:', err.message);
});

// ── Column name map: lowercase (pg) → camelCase (app) ───────────────────────
const COL_MAP = {
    ratingscounted:          'ratingsCount',
    ratingscount:            'ratingsCount',
    currentlyposted:         'currentlyPosted',
    roleexpecting:           'roleExpecting',
    lacksin:                 'lacksIn',
    entryexamcompleted:      'entryExamCompleted',
    trustscore:              'trustScore',
    verificationcode:        'verificationCode',
    resetpasswordcode:       'resetPasswordCode',
    failedloginattempts:     'failedLoginAttempts',
    lockuntil:               'lockUntil',
    createdat:               'createdAt',
    senderid:                'senderId',
    receiverid:              'receiverId',
    userid:                  'userId',
    videoid:                 'videoId',
    meetlink:                'meetLink',
    ratingsubmitted:         'ratingSubmitted',
    starrating:              'starRating',
    feedbackcomment:         'feedbackComment',
    achievementid:           'achievementId',
    unlockedat:              'unlockedAt',
    currentstreak:           'currentStreak',
    lastactivitydate:        'lastActivityDate',
    beststreak:              'bestStreak',
    certifiedat:             'certifiedAt',
    completedat:             'completedAt',
    ipaddress:               'ipAddress',
    useragent:               'userAgent',
    readstatus:              'readStatus',
    mediaurl:                'mediaUrl',
    mediatype:               'mediaType',
    repliedtoid:             'repliedToId',
    sendername:              'senderName',
    receivername:            'receiverName',
    senderstudy:             'senderStudy',
    receiverstudy:           'receiverStudy',
    senderemail:             'senderEmail',
    receiveremail:           'receiverEmail',
    senderphoto:             'senderPhoto',
    receiverphoto:           'receiverPhoto',
};

function normaliseRow(row) {
    if (!row || typeof row !== 'object') return row;
    const out = {};
    for (const key of Object.keys(row)) {
        const mapped = COL_MAP[key.toLowerCase()];
        out[mapped || key] = row[key];
    }
    return out;
}

// ── Placeholder converter ────────────────────────────────────────────────────
function toPgSql(sql) {
    let idx = 0;
    return sql.replace(/\?/g, () => `$${++idx}`);
}

// ── SQL compatibility fixups ─────────────────────────────────────────────────
function fixSql(sql) {
    // Skip SQLite CREATE TABLE — schema already exists
    if (/CREATE\s+TABLE\s+IF\s+NOT\s+EXISTS/i.test(sql)) return null;

    // INSERT OR REPLACE → INSERT … ON CONFLICT DO NOTHING (generic fallback)
    sql = sql.replace(/INSERT\s+OR\s+REPLACE\s+INTO/gi, 'INSERT INTO');

    // SQLite date('now') → CURRENT_DATE
    sql = sql.replace(/date\s*\(\s*'now'\s*\)/gi, 'CURRENT_DATE');

    // SQLite MIN() in UPDATE SET → PostgreSQL LEAST()
    // e.g. trustScore = MIN(900, trustScore + 20)  → LEAST(900, trustscore + 20)
    sql = sql.replace(/\bMIN\s*\(/g, 'LEAST(');

    // Camel-case column identifiers in SQL → lowercase (PostgreSQL stores unquoted as lowercase)
    // We do a targeted replace so we don't mangle values or keywords
    const colReplacements = [
        ['senderId',            'senderid'],
        ['receiverId',          'receiverid'],
        ['readStatus',          'readstatus'],
        ['mediaUrl',            'mediaurl'],
        ['mediaType',           'mediatype'],
        ['repliedToId',         'repliedtoid'],
        ['ratingsCount',        'ratingscount'],
        ['currentlyPosted',     'currentlyposted'],
        ['roleExpecting',       'roleexpecting'],
        ['lacksIn',             'lacksin'],
        ['entryExamCompleted',  'entryexamcompleted'],
        ['trustScore',          'trustscore'],
        ['verificationCode',    'verificationcode'],
        ['resetPasswordCode',   'resetpasswordcode'],
        ['failedLoginAttempts', 'failedloginattempts'],
        ['lockUntil',           'lockuntil'],
        ['createdAt',           'createdat'],
        ['userId',              'userid'],
        ['videoId',             'videoid'],
        ['meetLink',            'meetlink'],
        ['ratingSubmitted',     'ratingsubmitted'],
        ['starRating',          'starrating'],
        ['feedbackComment',     'feedbackcomment'],
        ['achievementId',       'achievementid'],
        ['unlockedAt',          'unlockedat'],
        ['currentStreak',       'currentstreak'],
        ['lastActivityDate',    'lastactivitydate'],
        ['bestStreak',          'beststreak'],
        ['certifiedAt',         'certifiedat'],
        ['completedAt',         'completedat'],
        ['ipAddress',           'ipaddress'],
        ['userAgent',           'useragent'],
        // Aliases that appear in SELECT … AS senderName etc.
        ['senderName',          'sendername'],
        ['receiverName',        'receivername'],
        ['senderStudy',         'senderstudy'],
        ['receiverStudy',       'receiverstudy'],
        ['senderEmail',         'senderemail'],
        ['receiverEmail',       'receiveremail'],
        ['senderPhoto',         'senderphoto'],
        ['receiverPhoto',       'receiverphoto'],
    ];

    // Replace camelCase column names (as whole words) with lowercase equivalents
    for (const [camel, lower] of colReplacements) {
        // Use word boundary matching to avoid partial replacements
        sql = sql.replace(new RegExp(`\\b${camel}\\b`, 'g'), lower);
    }

    return sql;
}

// ── Public helpers ───────────────────────────────────────────────────────────

async function query(sql, params = []) {
    const fixed = fixSql(sql);
    if (fixed === null) return [];
    const pgSql = toPgSql(fixed);
    const result = await pool.query(pgSql, params);
    return result.rows.map(normaliseRow);
}

async function get(sql, params = []) {
    const fixed = fixSql(sql);
    if (fixed === null) return null;
    const pgSql = toPgSql(fixed);
    const result = await pool.query(pgSql, params);
    return result.rows[0] ? normaliseRow(result.rows[0]) : null;
}

async function run(sql, params = []) {
    const fixed = fixSql(sql);
    if (fixed === null) return { id: null, changes: 0 };

    let pgSql = toPgSql(fixed);

    // Auto-append RETURNING id on INSERT statements
    if (/^\s*INSERT\s+/i.test(pgSql) && !/RETURNING/i.test(pgSql)) {
        pgSql = pgSql.replace(/;?\s*$/, '') + ' RETURNING id';
    }

    const result = await pool.query(pgSql, params);
    const id      = result.rows[0]?.id ?? null;
    const changes = result.rowCount ?? 0;
    return { id, changes };
}

// ── Schema initialiser ───────────────────────────────────────────────────────
async function initDb() {
    console.log('🚀  Initialising Supabase PostgreSQL schema…');
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Users (all columns lowercase — no quoted identifiers needed)
        await client.query(`
            CREATE TABLE IF NOT EXISTS users (
                id                   BIGSERIAL PRIMARY KEY,
                name                 TEXT NOT NULL,
                email                TEXT UNIQUE NOT NULL,
                password             TEXT NOT NULL,
                studied              TEXT,
                city                 TEXT,
                state                TEXT,
                languages            TEXT,
                rating               REAL DEFAULT 5.0,
                ratingscount         INTEGER DEFAULT 0,
                currentlyposted      TEXT,
                roleexpecting        TEXT,
                lacksin              TEXT,
                level                INTEGER DEFAULT 1,
                xp                   INTEGER DEFAULT 0,
                credits              INTEGER DEFAULT 50,
                trustscore           INTEGER DEFAULT 750,
                photo                TEXT,
                role                 TEXT DEFAULT 'User',
                entryexamcompleted   INTEGER DEFAULT 0,
                verified             INTEGER DEFAULT 0,
                verificationcode     TEXT,
                resetpasswordcode    TEXT,
                failedloginattempts  INTEGER DEFAULT 0,
                lockuntil            BIGINT DEFAULT 0,
                createdat            TIMESTAMPTZ DEFAULT NOW()
            )
        `);

        // 2. User Skills
        await client.query(`
            CREATE TABLE IF NOT EXISTS user_skills (
                userid BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                skill  TEXT NOT NULL,
                type   TEXT NOT NULL,
                PRIMARY KEY (userid, skill, type)
            )
        `);

        // 3. Swap Requests
        await client.query(`
            CREATE TABLE IF NOT EXISTS requests (
                id         BIGSERIAL PRIMARY KEY,
                senderid   BIGINT REFERENCES users(id) ON DELETE CASCADE,
                receiverid BIGINT REFERENCES users(id) ON DELETE CASCADE,
                skill      TEXT,
                status     TEXT DEFAULT 'pending',
                createdat  TIMESTAMPTZ DEFAULT NOW()
            )
        `);

        // 4. Meetings
        await client.query(`
            CREATE TABLE IF NOT EXISTS meetings (
                id               BIGSERIAL PRIMARY KEY,
                senderid         BIGINT REFERENCES users(id) ON DELETE CASCADE,
                receiverid       BIGINT REFERENCES users(id) ON DELETE CASCADE,
                skill            TEXT,
                date             TEXT,
                time             TEXT,
                meetlink         TEXT,
                status           TEXT DEFAULT 'scheduled',
                ratingsubmitted  INTEGER DEFAULT 0,
                starrating       INTEGER,
                feedbackcomment  TEXT,
                createdat        TIMESTAMPTZ DEFAULT NOW()
            )
        `);

        // 5. Course Completions
        await client.query(`
            CREATE TABLE IF NOT EXISTS completions (
                id          BIGSERIAL PRIMARY KEY,
                userid      BIGINT REFERENCES users(id) ON DELETE CASCADE,
                videoid     TEXT NOT NULL,
                skill       TEXT NOT NULL,
                completedat TIMESTAMPTZ DEFAULT NOW()
            )
        `);

        // 6. Certifications
        await client.query(`
            CREATE TABLE IF NOT EXISTS certifications (
                id          BIGSERIAL PRIMARY KEY,
                userid      BIGINT REFERENCES users(id) ON DELETE CASCADE,
                skill       TEXT NOT NULL,
                level       TEXT NOT NULL,
                date        TEXT NOT NULL,
                score       INTEGER NOT NULL,
                certifiedat TIMESTAMPTZ DEFAULT NOW()
            )
        `);

        // 7. Audit Logs
        await client.query(`
            CREATE TABLE IF NOT EXISTS audit_logs (
                id        BIGSERIAL PRIMARY KEY,
                userid    BIGINT REFERENCES users(id) ON DELETE CASCADE,
                action    TEXT NOT NULL,
                ipaddress TEXT,
                useragent TEXT,
                createdat TIMESTAMPTZ DEFAULT NOW()
            )
        `);

        // 8. Messages
        await client.query(`
            CREATE TABLE IF NOT EXISTS messages (
                id          BIGSERIAL PRIMARY KEY,
                senderid    BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                receiverid  BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                message     TEXT,
                mediaurl    TEXT,
                mediatype   TEXT,
                repliedtoid BIGINT REFERENCES messages(id) ON DELETE SET NULL,
                reactions   TEXT DEFAULT '{}',
                readstatus  INTEGER DEFAULT 0,
                createdat   TIMESTAMPTZ DEFAULT NOW()
            )
        `);

        // 9. Streaks
        await client.query(`
            CREATE TABLE IF NOT EXISTS streaks (
                id               BIGSERIAL PRIMARY KEY,
                userid           BIGINT UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                currentstreak    INTEGER DEFAULT 0,
                lastactivitydate TEXT,
                beststreak       INTEGER DEFAULT 0
            )
        `);

        // 10. Achievements
        await client.query(`
            CREATE TABLE IF NOT EXISTS achievements (
                id            BIGSERIAL PRIMARY KEY,
                userid        BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                achievementid TEXT NOT NULL,
                unlockedat    TIMESTAMPTZ DEFAULT NOW()
            )
        `);

        // 11. Notifications
        await client.query(`
            CREATE TABLE IF NOT EXISTS notifications (
                id         BIGSERIAL PRIMARY KEY,
                userid     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                title      TEXT NOT NULL,
                message    TEXT NOT NULL,
                type       TEXT NOT NULL,
                readstatus INTEGER DEFAULT 0,
                createdat  TIMESTAMPTZ DEFAULT NOW()
            )
        `);

        // 12. AI Roadmaps
        await client.query(`
            CREATE TABLE IF NOT EXISTS ai_roadmaps (
                id        BIGSERIAL PRIMARY KEY,
                userid    BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                skill     TEXT NOT NULL,
                roadmap   TEXT NOT NULL,
                createdat TIMESTAMPTZ DEFAULT NOW()
            )
        `);

        // 13. Adaptive Assessments
        await client.query(`
            CREATE TABLE IF NOT EXISTS adaptive_assessments (
                id        BIGSERIAL PRIMARY KEY,
                userid    BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                skill     TEXT NOT NULL,
                score     INTEGER NOT NULL,
                details   TEXT NOT NULL,
                createdat TIMESTAMPTZ DEFAULT NOW()
            )
        `);

        // 14. Push Subscriptions
        await client.query(`
            CREATE TABLE IF NOT EXISTS push_subscriptions (
                id        BIGSERIAL PRIMARY KEY,
                user_id   BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                endpoint  TEXT NOT NULL UNIQUE,
                p256dh    TEXT NOT NULL,
                auth      TEXT NOT NULL,
                createdat TIMESTAMPTZ DEFAULT NOW()
            )
        `);

        // Forum posts table
        await client.query(`
            CREATE TABLE IF NOT EXISTS forum_posts (
                id SERIAL PRIMARY KEY,
                userid INTEGER REFERENCES users(id) ON DELETE CASCADE,
                title TEXT NOT NULL,
                body TEXT NOT NULL,
                tag VARCHAR(50) DEFAULT 'General',
                likes INTEGER DEFAULT 0,
                createdat TIMESTAMPTZ DEFAULT NOW()
            )
        `);

        // Forum replies table
        await client.query(`
            CREATE TABLE IF NOT EXISTS forum_replies (
                id SERIAL PRIMARY KEY,
                postid INTEGER REFERENCES forum_posts(id) ON DELETE CASCADE,
                userid INTEGER REFERENCES users(id) ON DELETE CASCADE,
                body TEXT NOT NULL,
                createdat TIMESTAMPTZ DEFAULT NOW()
            )
        `);

        await client.query('COMMIT');
        console.log('✅  Schema ready.');

        // Seed users if table is empty
        const { rows } = await client.query('SELECT COUNT(*) AS count FROM users');
        if (parseInt(rows[0].count, 10) === 0) {
            await seedUsers(client);
        }
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌  Schema init failed:', err.message);
        throw err;
    } finally {
        client.release();
    }
}

// ── Seed initial mock users ──────────────────────────────────────────────────
async function seedUsers(client) {
    console.log('🌱  Seeding initial mock users…');

    const initialPeers = [
        {
            name: 'Sarah Chen', email: 'sarah@domain.com', password: 'password123',
            studied: 'B.S. Cognitive Science (UC Berkeley)', city: 'San Francisco', state: 'California',
            languages: ['English', 'Mandarin'],
            skillsOffer: ['Figma', 'UI Design', 'HTML', 'CSS'], skillsLearn: ['React', 'Python', 'Node.js'],
            rating: 4.8, ratingsCount: 24, currentlyPosted: 'Google', roleExpecting: 'UX Engineer',
            lacksIn: ['React', 'Python', 'Data Structures'],
            photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
            role: 'User', entryExamCompleted: 1, credits: 65, trustScore: 780,
            certifications: [{ skill: 'Figma', level: 'Beginner', date: '7/10/2026', score: 90 }]
        },
        {
            name: 'Carlos Mendez', email: 'carlos@domain.com', password: 'password123',
            studied: 'M.S. Data Science (UT Austin)', city: 'Austin', state: 'Texas',
            languages: ['English', 'Spanish'],
            skillsOffer: ['Python', 'SQL', 'Data Science'], skillsLearn: ['React', 'CSS', 'UI Design'],
            rating: 4.9, ratingsCount: 31, currentlyPosted: 'Tesla', roleExpecting: 'Senior Data Scientist',
            lacksIn: ['Figma', 'CSS Grid', 'React Components'],
            photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
            role: 'User', entryExamCompleted: 1, credits: 80, trustScore: 820,
            certifications: [{ skill: 'Python', level: 'Intermediate', date: '7/12/2026', score: 95 }]
        },
        {
            name: 'Aisha Patel', email: 'aisha@domain.com', password: 'password123',
            studied: 'B.Tech Computer Science (IIT Bombay)', city: 'Mumbai', state: 'Maharashtra',
            languages: ['English', 'Hindi'],
            skillsOffer: ['React', 'JavaScript', 'Node.js'], skillsLearn: ['Figma', 'AWS', 'Docker'],
            rating: 4.7, ratingsCount: 18, currentlyPosted: 'Microsoft', roleExpecting: 'Fullstack Engineer',
            lacksIn: ['Figma Layouts', 'Cloud Deployment', 'UX Research'],
            photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
            role: 'User', entryExamCompleted: 1, credits: 50, trustScore: 750, certifications: []
        },
        {
            name: 'Liam Kowalski', email: 'liam@domain.com', password: 'password123',
            studied: 'Self-Taught Systems Developer', city: 'Chicago', state: 'Illinois',
            languages: ['English', 'Polish'],
            skillsOffer: ['Node.js', 'Python', 'Docker', 'AWS'], skillsLearn: ['HTML', 'CSS', 'Figma', 'UI Design'],
            rating: 4.9, ratingsCount: 42, currentlyPosted: 'Amazon', roleExpecting: 'Backend Architect',
            lacksIn: ['CSS Animations', 'Figma Auto-Layout', 'Frontend Assembly'],
            photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
            role: 'User', entryExamCompleted: 1, credits: 50, trustScore: 750, certifications: []
        },
        {
            name: 'Yuki Tanaka', email: 'yuki@domain.com', password: 'password123',
            studied: 'B.A. Graphic Design (Tokyo Tech)', city: 'Seattle', state: 'Washington',
            languages: ['Japanese', 'English'],
            skillsOffer: ['Photoshop', 'Illustrator', 'Figma'], skillsLearn: ['JavaScript', 'HTML', 'CSS'],
            rating: 4.6, ratingsCount: 12, currentlyPosted: 'Adobe', roleExpecting: 'Creative Product Designer',
            lacksIn: ['JS Closures', 'DOM Manipulation', 'CSS Flexbox'],
            photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
            role: 'User', entryExamCompleted: 1, credits: 50, trustScore: 750, certifications: []
        },
        {
            name: 'Marcus Vance', email: 'marcus@domain.com', password: 'password123',
            studied: 'B.S. Software Engineering (UW)', city: 'Seattle', state: 'Washington',
            languages: ['English'],
            skillsOffer: ['Docker', 'AWS', 'Kubernetes'], skillsLearn: ['React', 'Python'],
            rating: 4.9, ratingsCount: 22, currentlyPosted: 'Netflix', roleExpecting: 'Lead Cloud Architect',
            lacksIn: ['Python', 'Figma Design'],
            photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=150&q=80',
            role: 'User', entryExamCompleted: 1, credits: 50, trustScore: 750, certifications: []
        },
        {
            name: 'Elena Rostova', email: 'elena@domain.com', password: 'password123',
            studied: 'B.Des Digital Media (Waterloo)', city: 'Toronto', state: 'Ontario',
            languages: ['English', 'Russian'],
            skillsOffer: ['CSS', 'Vue.js', 'Illustrator'], skillsLearn: ['SQL', 'Figma', 'Python'],
            rating: 4.8, ratingsCount: 16, currentlyPosted: 'Shopify', roleExpecting: 'Senior UX/Frontend Engineer',
            lacksIn: ['SQL Queries', 'Python Syntax'],
            photo: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&q=80',
            role: 'User', entryExamCompleted: 1, credits: 50, trustScore: 750, certifications: []
        },
        {
            name: 'Devon Lane', email: 'devon@domain.com', password: 'password123',
            studied: 'B.A. Business (Oxford)', city: 'London', state: 'UK',
            languages: ['English'],
            skillsOffer: ['Product Strategy', 'Agile', 'Scrum'], skillsLearn: ['SQL', 'Python', 'UI Design'],
            rating: 4.6, ratingsCount: 14, currentlyPosted: 'Spotify', roleExpecting: 'Technical Product Manager',
            lacksIn: ['SQL JOINs', 'Python Loops'],
            photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
            role: 'User', entryExamCompleted: 1, credits: 50, trustScore: 750, certifications: []
        },
        {
            name: 'Ananya Roy', email: 'ananya@domain.com', password: 'password123',
            studied: 'M.Tech Intelligence Systems (IISc Bangalore)', city: 'Bangalore', state: 'Karnataka',
            languages: ['English', 'Bengali'],
            skillsOffer: ['PyTorch', 'Python', 'Data Science'], skillsLearn: ['React', 'JavaScript'],
            rating: 4.9, ratingsCount: 38, currentlyPosted: 'Meta', roleExpecting: 'Machine Learning Researcher',
            lacksIn: ['React Hooks', 'CSS Flexbox'],
            photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80',
            role: 'User', entryExamCompleted: 1, credits: 50, trustScore: 750, certifications: []
        },
        {
            name: 'Lucas Dubois', email: 'lucas@domain.com', password: 'password123',
            studied: 'B.S. Communication (Sorbonne)', city: 'Paris', state: 'France',
            languages: ['French', 'English'],
            skillsOffer: ['Git', 'API Design', 'Technical Writing'], skillsLearn: ['Figma', 'Vue.js'],
            rating: 4.7, ratingsCount: 9, currentlyPosted: 'Stripe', roleExpecting: 'Developer Relations Manager',
            lacksIn: ['Figma Layouts', 'Vue Router'],
            photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80',
            role: 'User', entryExamCompleted: 1, credits: 50, trustScore: 750, certifications: []
        },
        {
            name: 'Balaji M', email: 'mbalajims1@gmail.com', password: 'admin123',
            studied: 'B.Tech Artificial Intelligence & Data Science (Paavai College of Engineering)',
            city: 'Namakkal', state: 'Tamil Nadu',
            languages: ['English', 'Tamil'],
            skillsOffer: ['Python', 'Machine Learning', 'TensorFlow', 'Deep Learning', 'FastAPI', 'Docker', 'AWS'],
            skillsLearn: ['SageMaker', 'Blockchain', 'Cloud DevOps', 'Kubernetes'],
            rating: 5.0, ratingsCount: 0, currentlyPosted: 'NexSkill Admin', roleExpecting: 'Administrator',
            lacksIn: [],
            photo: 'balaji_profile.jpg',
            role: 'Admin', entryExamCompleted: 1, credits: 100, trustScore: 900, certifications: []
        }
    ];

    for (const peer of initialPeers) {
        const hashedPassword = await bcrypt.hash(peer.password, 10);
        const res = await client.query(`
            INSERT INTO users (
                name, email, password, studied, city, state, languages,
                rating, ratingscount, currentlyposted, roleexpecting, lacksin,
                photo, role, entryexamcompleted, credits, trustscore, verified, xp, level
            ) VALUES (
                $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,1,100,2
            ) RETURNING id
        `, [
            peer.name, peer.email, hashedPassword, peer.studied, peer.city, peer.state,
            JSON.stringify(peer.languages), peer.rating, peer.ratingsCount,
            peer.currentlyPosted || '', peer.roleExpecting || '',
            JSON.stringify(peer.lacksIn || []),
            peer.photo, peer.role, peer.entryExamCompleted, peer.credits, peer.trustScore
        ]);
        const userId = res.rows[0].id;

        for (const skill of peer.skillsOffer) {
            await client.query(
                `INSERT INTO user_skills (userid, skill, type) VALUES ($1,$2,'offer') ON CONFLICT DO NOTHING`,
                [userId, skill]
            );
        }
        for (const skill of peer.skillsLearn) {
            await client.query(
                `INSERT INTO user_skills (userid, skill, type) VALUES ($1,$2,'learn') ON CONFLICT DO NOTHING`,
                [userId, skill]
            );
        }
        for (const cert of (peer.certifications || [])) {
            await client.query(
                `INSERT INTO certifications (userid, skill, level, date, score) VALUES ($1,$2,$3,$4,$5)`,
                [userId, cert.skill, cert.level, cert.date, cert.score]
            );
        }
    }
    console.log('✅  Seeding complete.');
}

module.exports = { query, get, run, initDb, pool };
