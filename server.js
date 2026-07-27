require('dotenv').config();
const express    = require('express');
const https      = require('https');
const http       = require('http');
const cors       = require('cors');
const path       = require('path');
const fs         = require('fs');
const helmet     = require('helmet');
const rateLimit  = require('express-rate-limit');
const selfsigned = require('selfsigned');
const { Server } = require('socket.io');
const { initDb } = require('./db');
const errorHandler = require('./middleware/errorHandler');

const app         = express();
const HTTPS_PORT  = process.env.HTTPS_PORT || 5000;
const TUNNEL_PORT = process.env.TUNNEL_PORT || 5001;

// ── 1. SSL Certificate loader / auto-generator ────────────────────────────
const certPath = path.join(__dirname, 'ssl', 'cert.pem');
const keyPath  = path.join(__dirname, 'ssl', 'key.pem');

async function loadOrGenerateCerts() {
    const sslDir = path.join(__dirname, 'ssl');
    if (!fs.existsSync(sslDir)) fs.mkdirSync(sslDir, { recursive: true });

    if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
        console.log('✅  SSL certificates loaded from ./ssl/');
        return {
            key:  fs.readFileSync(keyPath),
            cert: fs.readFileSync(certPath)
        };
    }

    console.log('🔐  Generating self-signed SSL certificate…');
    const attrs = [{ name: 'commonName', value: 'localhost' }];
    const opts  = {
        days: 825,
        algorithm: 'sha256',
        extensions: [{
            name: 'subjectAltName',
            altNames: [
                { type: 2, value: 'localhost' },
                { type: 7, ip: '127.0.0.1' }
            ]
        }]
    };
    const pems = await selfsigned.generate(attrs, opts);
    fs.writeFileSync(keyPath,  pems.private);
    fs.writeFileSync(certPath, pems.cert);
    console.log('✅  Certificate saved to ./ssl/');
    return { key: pems.private, cert: pems.cert };
}

// ── 2. Security Headers ───────────────────────────────────────────────────
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true }
}));

// ── 3. CORS & JSON body ───────────────────────────────────────────────────
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '10mb' }));

// ── 4. Rate limiters ──────────────────────────────────────────────────────
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    message: { msg: 'Too many requests. Try again in 15 minutes.' }
});
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    message: { msg: 'Too many auth attempts. Try again in 15 minutes.' }
});
app.use('/api',      apiLimiter);
app.use('/api/auth', authLimiter);

// ── 5. Routes ─────────────────────────────────────────────────────────────
const authRoutes         = require('./routes/auth');
const userRoutes         = require('./routes/users');
const requestRoutes      = require('./routes/requests');
const meetingRoutes      = require('./routes/meetings');
const progressRoutes     = require('./routes/progress');
const chatRoutes         = require('./routes/chat');
const aiRoutes           = require('./routes/ai');
const notificationRoutes = require('./routes/notifications');
const leaderboardRoutes  = require('./routes/leaderboard');
const forumRoutes        = require('./routes/forum');

app.use('/api/auth',          authRoutes);
app.use('/api/users',         userRoutes);
app.use('/api/requests',      requestRoutes);
app.use('/api/meetings',      meetingRoutes);
app.use('/api/progress',      progressRoutes);
app.use('/api/chat',          chatRoutes);
app.use('/api/ai',            aiRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/leaderboard',   leaderboardRoutes);
app.use('/api/forum',         forumRoutes);

// ── 6. Static files & SPA ─────────────────────────────────────────────────
app.use(express.static(__dirname));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.get('/',      (_req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/admin', (_req, res) => res.sendFile(path.join(__dirname, 'admin.html')));

// ── 7. Error handler ──────────────────────────────────────────────────────
app.use(errorHandler);

// ── 8. Start servers ──────────────────────────────────────────────────────
async function startServer() {
    try {
        await initDb();
        const ssl = await loadOrGenerateCerts();

        const line = '═'.repeat(58);

        // HTTPS — for you (local secure access)
        const httpsServer = https.createServer(ssl, app);

        // Attach Socket.io to the HTTPS server
        const io = new Server(httpsServer, {
            cors: { origin: '*', methods: ['GET', 'POST'] }
        });

        // Make io available to routes
        app.set('io', io);

        // Socket.io Real-Time Chat
        const onlineUsers = new Map(); // userId -> socketId

        io.on('connection', (socket) => {
            console.log(`🔌  Socket connected: ${socket.id}`);

            // User comes online
            socket.on('user_online', (userId) => {
                onlineUsers.set(String(userId), socket.id);
                io.emit('online_users', Array.from(onlineUsers.keys()));
            });

            // Join a private chat room
            socket.on('join_room', ({ userId, peerId }) => {
                const room = [userId, peerId].sort().join('_');
                socket.join(room);
            });

            // Send a chat message
            socket.on('send_message', (data) => {
                const room = [data.senderId, data.receiverId].sort().join('_');
                io.to(room).emit('message_received', data);
            });

            // Typing indicators
            socket.on('typing', ({ senderId, receiverId }) => {
                const room = [senderId, receiverId].sort().join('_');
                socket.to(room).emit('user_typing', { userId: senderId });
            });

            socket.on('stop_typing', ({ senderId, receiverId }) => {
                const room = [senderId, receiverId].sort().join('_');
                socket.to(room).emit('user_stop_typing', { userId: senderId });
            });

            // Message reactions
            socket.on('message_reaction', (data) => {
                const room = [data.senderId, data.receiverId].sort().join('_');
                io.to(room).emit('reaction_updated', data);
            });

            // Disconnect
            socket.on('disconnect', () => {
                for (const [userId, sid] of onlineUsers.entries()) {
                    if (sid === socket.id) {
                        onlineUsers.delete(userId);
                        break;
                    }
                }
                io.emit('online_users', Array.from(onlineUsers.keys()));
                console.log(`🔌  Socket disconnected: ${socket.id}`);
            });
        });

        httpsServer.listen(HTTPS_PORT, () => {
            console.log(`\n${line}`);
            console.log(` 🔒  NexSkill  ·  HTTPS / SSL  (local)`);
            console.log(` 🌐  https://localhost:${HTTPS_PORT}`);
            console.log(` 📊  Admin  →  https://localhost:${HTTPS_PORT}/admin`);
            console.log(line);
        });

        // HTTP — for the public tunnel
        const httpServer = http.createServer(app);
        const ioHttp = new Server(httpServer, {
            cors: { origin: '*', methods: ['GET', 'POST'] }
        });
        ioHttp.on('connection', () => {}); // tunnel connections mirror HTTPS io

        httpServer.listen(TUNNEL_PORT, () => {
            console.log(` 🌍  Public tunnel port  :${TUNNEL_PORT}  (plain HTTP for tunnel proxy)`);
            console.log(` 🔗  Run:  npx localtunnel --port ${TUNNEL_PORT} --subdomain nexskill`);
            console.log(`${line}\n`);
        });

        // ── Daily Push Notification Cron (9:00 AM IST = 3:30 AM UTC) ────
        const cron = require('node-cron');
        const pushService = require('./services/pushService');
        cron.schedule('30 3 * * *', async () => {
            console.log('⏰  Running daily push notification cron…');
            await pushService.sendDailyReminders();
        }, { timezone: 'UTC' });

    } catch (err) {
        console.error('❌  Server startup failed:', err.message);
        process.exit(1);
    }
}

startServer();
