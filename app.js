// ==========================================
// CLIENT STATE CONTROLLER (SaaS State Machine)
// ==========================================

const API_BASE = '/api';

// ==========================================
// SOCKET.IO REAL-TIME CLIENT
// ==========================================

let socket = null;
let typingTimer = null;

function initSocket() {
    if (socket && socket.connected) return;

    socket = io({ transports: ['websocket', 'polling'] });

    socket.on('connect', () => {
        console.log('🔌 Socket connected:', socket.id);
        if (state.user) {
            socket.emit('user_online', state.user.id);
        }
    });

    socket.on('message_received', (data) => {
        // Only refresh if the message is for the active chat
        if (
            state.activeChatPeer &&
            (String(data.senderId) === String(state.activeChatPeer) ||
             String(data.receiverId) === String(state.activeChatPeer))
        ) {
            loadChatMessagesStream();
        }
        // Always refresh conversation list for unread badges
        loadChatConversations();
    });

    socket.on('user_typing', ({ userId }) => {
        if (String(userId) === String(state.activeChatPeer)) {
            const indicator = document.getElementById('typing-indicator');
            const peerName = document.getElementById('chat-active-name')?.innerText || 'Peer';
            if (indicator) {
                document.getElementById('typing-name').innerText = peerName;
                indicator.classList.remove('hidden');
            }
        }
    });

    socket.on('user_stop_typing', ({ userId }) => {
        if (String(userId) === String(state.activeChatPeer)) {
            const indicator = document.getElementById('typing-indicator');
            if (indicator) indicator.classList.add('hidden');
        }
    });

    socket.on('online_users', (userIds) => {
        // Could update online dots — kept minimal for now
    });

    socket.on('disconnect', () => {
        console.log('🔌 Socket disconnected');
    });
}


const state = {
    token: localStorage.getItem('token') || null,
    user: null,
    activeTab: 'home',
    activeChatPeer: null,
    chatPollInterval: null,
    
    // Career Mock Interview state
    mockInterview: {
        questions: [],
        answers: [],
        currentIndex: 0,
        skill: '',
        difficulty: ''
    },
    
    // Adaptive Assessment state
    assessment: {
        questions: [],
        answers: [],
        currentIndex: 0,
        skill: ''
    },

    // Rating star active selector
    selectedRatingValue: 5,

    // Chat reply selector
    repliedToMessageId: null,

    // Mandatory Entry Exam state
    entryExam: {
        currentIndex: 0,
        score: 0,
        questions: [
            { q: "Which HTML5 element is used to encapsulate an independent, self-contained piece of content?", o: ["<section>", "<article>", "<aside>", "<div>"], a: 1 },
            { q: "What is the primary role of the Virtual DOM in React?", o: ["Directly styles DOM components", "Minimizes direct manipulation of the heavy browser DOM", "Connects database records to views", "Runs code compiled from C++"], a: 1 },
            { q: "Which statement is true regarding Python's tuples?", o: ["They can be mutated at runtime", "They are immutable collections", "They cannot contain duplicate values", "They must only contain string types"], a: 1 },
            { q: "Which CSS Flexbox property controls alignment along the cross-axis?", o: ["justify-content", "align-items", "flex-direction", "align-self"], a: 1 },
            { q: "In SQL, which operator is used to search for specified patterns in column values?", o: ["LIKE", "IN", "BETWEEN", "CONTAINS"], a: 0 }
        ],
        answers: []
    }
};

// ==========================================
// CORE APP LOADER & BOOTSTRAP
// ==========================================

document.addEventListener('DOMContentLoaded', () => {
    initApp();
});

async function initApp() {
    // Register Service Worker for push notifications
    if ('serviceWorker' in navigator) {
        try {
            await navigator.serviceWorker.register('/sw.js');
            console.log('✅ Service Worker registered');
        } catch (e) {
            console.warn('Service Worker registration failed:', e.message);
        }
    }

    // Check if token exists
    if (state.token) {
        try {
            await fetchUserProfile();
            showDashboardShell();
            initSocket();
        } catch (e) {
            handleLogout();
        }
    } else {
        showAuthForms();
    }
    lucide.createIcons();
}

// ==========================================
// HTTP SERVICE CLIENT (Central API Dispatcher)
// ==========================================

async function apiRequest(path, method = 'GET', body = null) {
    const headers = {
        'Content-Type': 'application/json'
    };
    if (state.token) {
        headers['Authorization'] = `Bearer ${state.token}`;
    }

    const options = {
        method,
        headers
    };

    if (body) {
        options.body = JSON.stringify(body);
    }

    const res = await fetch(`${API_BASE}${path}`, options);
    const data = await res.json();
    
    if (!res.ok) {
        throw new Error(data.msg || 'API Request failed.');
    }
    
    return data;
}

// Fetch user profile from backend
async function fetchUserProfile() {
    const user = await apiRequest('/users/profile');
    state.user = user;
    updateMetricChips();
    updateSidebarProfile();
}

// ==========================================
// AUTHENTICATION & LOGIN WORKFLOWS
// ==========================================

function showAuthForms() {
    document.getElementById('auth-container').classList.remove('hidden');
    document.getElementById('app-shell').classList.add('hidden');
    document.getElementById('entry-level-exam-overlay').classList.add('hidden');
    
    // Switch to active tab login
    switchAuthTab('login');
}

function showDashboardShell() {
    document.getElementById('auth-container').classList.add('hidden');
    document.getElementById('app-shell').classList.remove('hidden');
    
    // Toggle Admin Portal visibility if Admin
    const adminLink = document.getElementById('nav-admin-portal');
    if (state.user.role === 'Admin') {
        adminLink.classList.remove('hidden');
    } else {
        adminLink.classList.add('hidden');
    }

    // Toggle Entry Exam overlay if needed
    if (state.user.entryExamCompleted === 0) {
        showEntryExamOverlay();
    } else {
        document.getElementById('entry-level-exam-overlay').classList.add('hidden');
    }

    // Update Onboarding card state
    updateOnboardingChecklist();
    
    // Show push notification permission banner if not yet subscribed
    if ('Notification' in window && Notification.permission === 'default') {
        const banner = document.getElementById('push-permission-banner');
        if (banner) banner.classList.remove('hidden');
    }

    // Load initial tab
    showTab(state.activeTab);
}

// Switch between Sign In / Register tabs
function switchAuthTab(tab) {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const tabs = document.querySelectorAll('#auth-navigation-tabs .auth-tab');

    // Reset forms visibility
    document.getElementById('otp-panel').classList.add('hidden');
    document.getElementById('forgot-password-panel').classList.add('hidden');
    document.getElementById('reset-password-panel').classList.add('hidden');

    if (tab === 'login') {
        loginForm.classList.add('active-form');
        registerForm.classList.remove('active-form');
        tabs[0].classList.add('active');
        tabs[1].classList.remove('active');
    } else {
        loginForm.classList.remove('active-form');
        registerForm.classList.add('active-form');
        tabs[0].classList.remove('active');
        tabs[1].classList.add('active');
    }
}

// Preview avatar upload image (preview only for registration form)
let uploadedPhotoBase64 = '';
function previewPhoto(input, previewId) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById(previewId).src = e.target.result;
            uploadedPhotoBase64 = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

// Preview AND upload avatar to server (profile page)
async function previewAndUploadAvatar(input) {
    const file = input.files[0];
    if (!file) return;

    // Preview immediately
    const reader = new FileReader();
    reader.onload = (e) => {
        document.getElementById('prof-photo-preview').src = e.target.result;
    };
    reader.readAsDataURL(file);

    // Upload to server via FormData
    const statusEl = document.getElementById('avatar-upload-status');
    if (statusEl) statusEl.innerText = 'Uploading...';

    try {
        const formData = new FormData();
        formData.append('avatar', file);

        const res = await fetch(`${API_BASE}/users/avatar`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${state.token}` },
            body: formData
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.msg || 'Upload failed');

        // Update local state and sidebar avatar
        state.user.photo = data.photo;
        updateSidebarProfile();
        if (statusEl) statusEl.innerText = '✅ Photo updated!';
        showToast('Profile photo updated!', 'success');

        // Clear status after 3s
        setTimeout(() => { if (statusEl) statusEl.innerText = ''; }, 3000);
    } catch (e) {
        if (statusEl) statusEl.innerText = `❌ ${e.message}`;
        showToast(e.message, 'error');
    }
}

// Submit Sign In Form
async function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const data = await apiRequest('/auth/login', 'POST', { email, password });
        state.token = data.token;
        state.user = data.user;
        localStorage.setItem('token', data.token);
        
        showToast('Login successful! Welcome back.', 'success');
        showDashboardShell();
        initSocket();
    } catch (e) {
        showToast(e.message, 'error');
    }
}

// Submit Registration Form
async function handleRegister(event) {
    event.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const studied = document.getElementById('reg-study').value;
    const city = document.getElementById('reg-city').value;
    const stateVal = document.getElementById('reg-state').value;
    
    // Parse strings
    const languages = document.getElementById('reg-languages').value.split(',').map(s => s.trim()).filter(Boolean);
    const skillsOffer = document.getElementById('reg-skills-offer').value.split(',').map(s => s.trim()).filter(Boolean);
    const skillsLearn = document.getElementById('reg-skills-learn').value.split(',').map(s => s.trim()).filter(Boolean);

    try {
        const data = await apiRequest('/auth/register', 'POST', {
            name, email, password, studied, city, state: stateVal,
            languages, skillsOffer, skillsLearn, photo: uploadedPhotoBase64
        });
        
        showToast(data.msg, 'info');

        // Transition to OTP verification panel
        document.getElementById('login-form').classList.remove('active-form');
        document.getElementById('register-form').classList.remove('active-form');
        document.getElementById('otp-panel').classList.remove('hidden');
        document.getElementById('verification-target-email').innerText = email;
        
        // Auto fill OTP in console for developer/tester validation convenience
        if (data.verificationCode) {
            console.log(`[Developer Simulator] Registration OTP code is: ${data.verificationCode}`);
            document.getElementById('otp-code').value = data.verificationCode;
        }
    } catch (e) {
        showToast(e.message, 'error');
    }
}

// Submit OTP Verification Form
async function handleOTPVerify(event) {
    event.preventDefault();
    const email = document.getElementById('verification-target-email').innerText;
    const code = document.getElementById('otp-code').value;

    try {
        const data = await apiRequest('/auth/verify', 'POST', { email, code });
        state.token = data.token;
        localStorage.setItem('token', data.token);
        
        await fetchUserProfile();
        showToast('Account successfully verified & activated!', 'success');
        showDashboardShell();
        initSocket();
    } catch (e) {
        showToast(e.message, 'error');
    }
}

// Forgot Password Flow
function showForgotPasswordForm() {
    document.getElementById('login-form').classList.remove('active-form');
    document.getElementById('forgot-password-panel').classList.remove('hidden');
}

// showAuthForms is defined above (consolidated)

async function handleForgotSubmit(event) {
    event.preventDefault();
    const email = document.getElementById('forgot-email').value;

    try {
        const data = await apiRequest('/auth/forgot-password', 'POST', { email });
        showToast(data.msg, 'info');
        
        // Show Reset password console
        document.getElementById('forgot-password-panel').classList.add('hidden');
        document.getElementById('reset-password-panel').classList.remove('hidden');
        document.getElementById('reset-email').value = email;

        if (data.code) {
            console.log(`[Developer Simulator] Reset Password OTP code is: ${data.code}`);
            document.getElementById('reset-code').value = data.code;
        }
    } catch (e) {
        showToast(e.message, 'error');
    }
}

async function handleResetSubmit(event) {
    event.preventDefault();
    const email = document.getElementById('reset-email').value;
    const code = document.getElementById('reset-code').value;
    const newPassword = document.getElementById('reset-new-password').value;

    try {
        const data = await apiRequest('/auth/reset-password', 'POST', { email, code, newPassword });
        showToast(data.msg, 'success');
        showAuthForms();
    } catch (e) {
        showToast(e.message, 'error');
    }
}

// Logout workflow
function handleLogout() {
    state.token = null;
    state.user = null;
    localStorage.removeItem('token');
    if (state.chatPollInterval) {
        clearInterval(state.chatPollInterval);
    }
    showToast('Signed out successfully.', 'info');
    showAuthForms();
}

// ==========================================
// MANDATORY ENTRY VERIFICATION EXAM
// ==========================================

function showEntryExamOverlay() {
    document.getElementById('entry-level-exam-overlay').classList.remove('hidden');
    state.entryExam.currentIndex = 0;
    state.entryExam.answers = [];
    renderEntryQuestion();
}

function renderEntryQuestion() {
    const exam = state.entryExam;
    const qIdx = exam.currentIndex;
    const currentQ = exam.questions[qIdx];
    
    document.getElementById('entry-question-index').innerText = `Question ${qIdx + 1} of ${exam.questions.length}`;
    document.getElementById('entry-question-text').innerText = currentQ.q;
    
    const progressFill = (qIdx / exam.questions.length) * 100;
    document.getElementById('entry-quiz-progress').style.width = `${progressFill}%`;

    const optionsList = document.getElementById('entry-quiz-options');
    optionsList.innerHTML = '';

    currentQ.o.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-option-btn';
        btn.innerHTML = `<span style="font-weight:600; margin-right:8px;">${String.fromCharCode(65 + idx)}.</span> ${opt}`;
        btn.onclick = () => selectEntryOption(idx, btn);
        optionsList.appendChild(btn);
    });

    document.getElementById('entry-quiz-alert').innerText = 'Select an answer to proceed.';
}

let activeEntrySelection = null;
function selectEntryOption(idx, buttonElement) {
    activeEntrySelection = idx;
    
    // Clear selections
    const btns = document.querySelectorAll('#entry-quiz-options .quiz-option-btn');
    btns.forEach(b => b.classList.remove('selected'));
    
    buttonElement.classList.add('selected');
    document.getElementById('entry-quiz-alert').innerText = 'Answer selected. Ready to proceed.';
}

async function submitEntryAnswer() {
    if (activeEntrySelection === null) {
        document.getElementById('entry-quiz-alert').innerText = '⚠️ Please select an option first.';
        return;
    }

    const exam = state.entryExam;
    const currentQ = exam.questions[exam.currentIndex];
    
    // Check correct
    if (activeEntrySelection === currentQ.a) {
        exam.score++;
    }

    exam.currentIndex++;
    activeEntrySelection = null;

    if (exam.currentIndex < exam.questions.length) {
        renderEntryQuestion();
    } else {
        // Exam finished! Save results
        try {
            const data = await apiRequest('/progress/entry-exam', 'POST');
            state.user = data.user;
            
            updateMetricChips();
            updateSidebarProfile();
            document.getElementById('entry-level-exam-overlay').classList.add('hidden');
            
            showToast('Entry assessment complete! Dashboard unlocked.', 'success');
            showDashboardShell();
        } catch (e) {
            showToast(e.message, 'error');
        }
    }
}

// ==========================================
// METRIC BADGES & UI UPDATERS
// ==========================================

function updateMetricChips() {
    document.getElementById('user-credits').innerText = state.user.credits;
    document.getElementById('user-trust-score').innerText = state.user.trustScore;
    document.getElementById('user-xp').innerText = state.user.xp || 0;
}

function updateSidebarProfile() {
    document.getElementById('sidebar-name').innerText = state.user.name;
    document.getElementById('sidebar-role').innerText = `Level ${state.user.level || 1} Developer`;

    const initials = state.user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    const placeholder = document.getElementById('sidebar-avatar-initials');
    const avatar = document.getElementById('sidebar-avatar');

    if (state.user.photo && state.user.photo.trim() !== '') {
        avatar.src = state.user.photo;
        avatar.classList.remove('hidden');
        placeholder.classList.add('hidden');
    } else {
        avatar.classList.add('hidden');
        placeholder.innerText = initials;
        placeholder.classList.remove('hidden');
    }
}

function updateOnboardingChecklist() {
    const verifyLi = document.getElementById('chk-verify');
    const examLi = document.getElementById('chk-exam');
    const profileLi = document.getElementById('chk-profile');
    
    let isFullyOnboarded = true;

    // 1. Verification status
    if (state.user.verified === 1) {
        verifyLi.classList.add('done');
        verifyLi.innerHTML = `<i data-lucide="check-circle" style="color:var(--color-success);"></i> Email verification complete (+20 Credits)`;
    } else {
        isFullyOnboarded = false;
    }

    // 2. Exam status
    if (state.user.entryExamCompleted === 1) {
        examLi.classList.add('done');
        examLi.innerHTML = `<i data-lucide="check-circle" style="color:var(--color-success);"></i> Complete general tech entry exam (+20 Credits, +30 Trust)`;
    } else {
        isFullyOnboarded = false;
    }

    // 3. Profile status
    if (state.user.skillsOffer && state.user.skillsOffer.length > 0) {
        profileLi.classList.add('done');
        profileLi.innerHTML = `<i data-lucide="check-circle" style="color:var(--color-success);"></i> Customize profile with learning goals`;
    } else {
        isFullyOnboarded = false;
    }

    // Toggle checklist container
    if (isFullyOnboarded) {
        document.getElementById('onboarding-card').classList.add('hidden');
    } else {
        document.getElementById('onboarding-card').classList.remove('hidden');
    }
}

// ==========================================
// NAVIGATION TAB SWITCHER
// ==========================================

function showTab(tabId) {
    state.activeTab = tabId;
    
    // Hide all views
    document.querySelectorAll('.tab-view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(b => b.classList.remove('active'));

    // Show selected view
    const view = document.getElementById(`view-${tabId}`);
    if (view) view.classList.add('active');

    // Highlight sidebar button
    const btn = document.querySelector(`.sidebar-nav .nav-item[data-tab="${tabId}"]`);
    if (btn) btn.classList.add('active');

    // View Header details
    const titles = {
        'home': { t: 'Dashboard Overview', s: 'Welcome back to your skill acceleration center.' },
        'discover': { t: 'Discover Partners', s: 'Find peers matching your exact learning needs.' },
        'chat': { t: 'SaaS Chat Room', s: 'Exchange code, resources, and coordinates in real-time.' },
        'meetings': { t: 'Sessions & Schedule', s: 'Book 1-on-1 calls and leave peer rating reviews.' },
        'roadmap': { t: 'AI Roadmap Planner', s: 'Generate interactive learning paths dynamically.' },
        'assessment': { t: 'AI MCQ Assessment', s: 'Evaluate and verify your technical skills.' },
        'profile': { t: 'Manage Profile', s: 'Customize profile specifics, view active badges, and certifications.' },
        'leaderboard': { t: 'Leaderboard', s: 'See who\'s leading the skill exchange community.' },
        'forum': { t: 'Community Forum', s: 'Discuss, share tips, and collaborate with peers.' }
    };

    if (titles[tabId]) {
        document.getElementById('view-title').innerText = titles[tabId].t;
        document.getElementById('view-subtitle').innerText = titles[tabId].s;
    }

    // Trigger tab specific loads
    if (tabId === 'home') {
        loadDashboardHome();
    } else if (tabId === 'discover') {
        loadPeersDiscovery();
    } else if (tabId === 'chat') {
        loadChatConversations();
    } else if (tabId === 'meetings') {
        loadMeetingsList();
    } else if (tabId === 'profile') {
        loadProfileForm();
    } else if (tabId === 'assessment') {
        loadAssessmentTracks();
    } else if (tabId === 'leaderboard') {
        loadLeaderboard('xp');
    } else if (tabId === 'forum') {
        loadForumPosts();
    }

    // Close mobile sidebar when switching tabs
    const sidebar = document.querySelector('.sidebar');
    if (sidebar && sidebar.classList.contains('open')) {
        toggleSidebar();
    }

    // Stop chat polling if switching away from chat
    if (tabId !== 'chat' && state.chatPollInterval) {
        clearInterval(state.chatPollInterval);
        state.chatPollInterval = null;
    }

    lucide.createIcons();
}

// ==========================================
// TAB WORKFLOW: DASHBOARD HOME
// ==========================================

async function loadDashboardHome() {
    try {
        // Load stats & notifications
        const recs = await apiRequest('/users/peers');

        // Render matching recommendations (limit to 3)
        const recsList = document.getElementById('recs-list');
        const loader = document.getElementById('recs-loading');
        
        loader.classList.add('hidden');
        recsList.innerHTML = '';
        recsList.classList.remove('hidden');

        const topMatches = recs.slice(0, 3);
        if (topMatches.length === 0) {
            recsList.innerHTML = `<div class="col-span-2 text-center text-muted p-3">No matching peers found. Try expanding your learn skills.</div>`;
        } else {
            topMatches.forEach(p => {
                const card = document.createElement('div');
                card.className = 'peer-card';
                card.innerHTML = `
                    <span class="match-percentage-badge">${p.matchScore}% Match</span>
                    <div class="peer-header">
                        <img src="${p.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}" class="peer-avatar" alt="${p.name}">
                        <div class="peer-info">
                            <h4>${p.name}</h4>
                            <span class="subtitle">${p.study || 'Student'} | ${p.place || ''}</span>
                        </div>
                    </div>
                    <div class="peer-details-tags">
                        <span class="peer-tag teach">Teaches: ${p.skillsOffer.slice(0, 2).join(', ')}</span>
                        <span class="peer-tag learn">Learns: ${p.skillsLearn.slice(0, 2).join(', ')}</span>
                    </div>
                    <div class="reasoning-list">
                        ${p.matchReasoning.slice(0, 2).map(r => `<div>• ${r}</div>`).join('')}
                    </div>
                    <button class="btn btn-secondary btn-small mt-3" onclick="sendSwapRequest(${p.id}, '${p.skillsOffer[0]}')">
                        <i data-lucide="git-pull-request" style="width:14px; height:14px;"></i>
                        <span>Send Swap Request</span>
                    </button>
                `;
                recsList.appendChild(card);
            });
        }

        // Render streaks & notifications details
        document.getElementById('gamification-streak').innerText = `${state.user.streak || 0} Days`;
        document.getElementById('gamification-badges').innerText = `${state.user.certifications.length} Badges`;

        // Render notifications list
        const notifyContainer = document.getElementById('notify-container');
        notifyContainer.innerHTML = '';
        
        // Fetch real in-app notifications from /api/notifications
        const notifyRows = await apiRequest('/notifications');
        const allNotifs = notifyRows.notifications || [];
        if (allNotifs.length > 0) {
            allNotifs.slice(0, 5).forEach(n => {
                const card = document.createElement('div');
                card.className = `notification-card ${!n.readStatus ? 'unread' : ''}`;
                card.innerHTML = `
                    <i data-lucide="bell" class="text-primary"></i>
                    <div>
                        <div class="title">${n.title}</div>
                        <div class="desc">${n.message}</div>
                    </div>
                `;
                card.onclick = () => {
                    apiRequest(`/notifications/${n.id}/read`, 'PATCH').catch(() => {});
                    card.classList.remove('unread');
                };
                notifyContainer.appendChild(card);
            });
        }

        // Also show pending skill requests as action notifications
        try {
            const reqRows = await apiRequest('/requests');
            if (reqRows.received && reqRows.received.length > 0) {
                reqRows.received.forEach(r => {
                    if (r.status === 'pending') {
                        const card = document.createElement('div');
                        card.className = 'notification-card unread';
                        card.innerHTML = `
                            <i data-lucide="git-pull-request" class="text-primary"></i>
                            <div>
                                <div class="title">Swap Request Received</div>
                                <div class="desc">${r.peerName} wants to swap skills on ${r.skill}.</div>
                                <div class="modal-actions mt-2" style="margin-top:8px;">
                                    <button class="btn btn-primary btn-small" onclick="handleRequestAction(${r.id}, 'accepted')">Accept</button>
                                    <button class="btn btn-secondary btn-small" onclick="handleRequestAction(${r.id}, 'rejected')">Decline</button>
                                </div>
                            </div>
                        `;
                        notifyContainer.appendChild(card);
                    }
                });
            }
        } catch (_) {}

        if (notifyContainer.innerHTML === '') {
            notifyContainer.innerHTML = `<div class="text-center text-muted p-3">No new notifications.</div>`;
        }

        lucide.createIcons();
    } catch (e) {
        showToast(e.message, 'error');
    }
}

// Onboarding actions helpers
async function handleRequestAction(requestId, action) {
    try {
        const data = await apiRequest(`/requests/${requestId}/action`, 'POST', { action });
        showToast(data.msg, 'success');
        await fetchUserProfile();
        loadDashboardHome();
    } catch (e) {
        showToast(e.message, 'error');
    }
}

// Send swap request
async function sendSwapRequest(peerId, skill) {
    try {
        const data = await apiRequest('/requests', 'POST', { receiverId: peerId, skill });
        showToast(data.msg, 'success');
        loadDashboardHome();
    } catch (e) {
        showToast(e.message, 'error');
    }
}

// ==========================================
// TAB WORKFLOW: DISCOVER PARTNERS
// ==========================================

let peersData = [];
async function loadPeersDiscovery() {
    const grid = document.getElementById('discover-peers-grid');
    grid.innerHTML = '<div class="text-center p-4">Loading peer directory...</div>';
    
    try {
        peersData = await apiRequest('/users/peers');
        renderPeersGrid(peersData);
    } catch (e) {
        grid.innerHTML = `<div class="text-center text-danger p-4">Error: ${e.message}</div>`;
    }
}

function renderPeersGrid(peersList) {
    const grid = document.getElementById('discover-peers-grid');
    grid.innerHTML = '';

    if (peersList.length === 0) {
        grid.innerHTML = `<div class="text-center text-muted p-4">No peers matching search filters.</div>`;
        return;
    }

    peersList.forEach(p => {
        const card = document.createElement('div');
        card.className = 'peer-card';
        card.style.cursor = 'pointer';
        card.onclick = (e) => {
            // Don't open modal if clicking the Connect button
            if (e.target.closest('button')) return;
            openPeerProfileModal(p);
        };
        card.innerHTML = `
            <span class="match-percentage-badge">${p.matchScore}% Match</span>
            <div class="peer-header">
                <img src="${p.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80'}" class="peer-avatar" alt="${p.name}">
                <div class="peer-info">
                    <h4>${p.name}</h4>
                    <span class="subtitle">${p.study || 'Student'} | ${p.place || ''}</span>
                    <span class="subtitle" style="color:var(--color-warning);">Rating: ${p.rating} ★ (${p.ratingsCount} reviews)</span>
                </div>
            </div>
            <div class="peer-details-tags">
                <span class="peer-tag teach">Teaches: ${p.skillsOffer.join(', ')}</span>
                <span class="peer-tag learn">Learns: ${p.skillsLearn.join(', ')}</span>
            </div>
            <div class="reasoning-list mt-2">
                ${p.matchReasoning.map(r => `<div>• ${r}</div>`).join('')}
            </div>
            <div style="display:flex; gap:8px; margin-top: 15px;">
                <button class="btn btn-primary btn-block btn-small" onclick="sendSwapRequest(${p.id}, '${p.skillsOffer[0]}')">
                    <i data-lucide="git-pull-request" style="width:14px; height:14px;"></i>
                    <span>Connect</span>
                </button>
            </div>
        `;
        grid.appendChild(card);
    });
    lucide.createIcons();
}

function filterDiscoverPeers() {
    const q = document.getElementById('discover-search').value.toLowerCase().trim();
    if (!q) {
        renderPeersGrid(peersData);
        return;
    }
    const filtered = peersData.filter(p => 
        p.name.toLowerCase().includes(q) ||
        p.study.toLowerCase().includes(q) ||
        p.place.toLowerCase().includes(q) ||
        p.skillsOffer.some(s => s.toLowerCase().includes(q))
    );
    renderPeersGrid(filtered);
}

// ==========================================
// TAB WORKFLOW: SAAS REAL-TIME CHAT
// ==========================================

async function loadChatConversations() {
    const container = document.getElementById('chat-channels-container');
    container.innerHTML = '<div class="text-center p-3 text-muted">Loading channels...</div>';

    try {
        const convs = await apiRequest('/chat/conversations');
        container.innerHTML = '';
        
        if (convs.length === 0) {
            container.innerHTML = '<div class="text-center p-4 text-muted" style="font-size:0.85rem;">No active channels. Send connection requests to start chatting!</div>';
            return;
        }

        convs.forEach(c => {
            const initials = c.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
            const activeClass = state.activeChatPeer === c.id ? 'active' : '';
            const unreadBadge = c.unreadCount > 0 ? `<span class="chat-channel-unread">${c.unreadCount}</span>` : '';
            
            const btn = document.createElement('button');
            btn.className = `chat-channel-item ${activeClass}`;
            btn.onclick = () => selectChatPeer(c.id, c.name, c.photo, c.trustScore);
            btn.innerHTML = `
                <div class="avatar-wrapper">
                    ${c.photo ? `<img src="${c.photo}" class="avatar">` : `<div class="avatar-placeholder" style="width:36px; height:36px; font-size:0.85rem;">${initials}</div>`}
                </div>
                <div class="chat-channel-info">
                    <span class="chat-channel-name">${c.name}</span>
                    <span class="chat-channel-last">${c.lastMessage || 'Click to write...'}</span>
                </div>
                ${unreadBadge}
            `;
            container.appendChild(btn);
        });

        // Initialize Socket.io room instead of polling
        if (socket) {
            socket.emit('user_online', state.user.id);
        }
    } catch (e) {
        container.innerHTML = `<div class="text-center p-3 text-danger">Error: ${e.message}</div>`;
    }
}

async function selectChatPeer(peerId, name, photo, trustScore) {
    state.activeChatPeer = peerId;
    state.repliedToMessageId = null;

    // Toggle Panels
    document.getElementById('chat-empty-panel').classList.add('hidden');
    document.getElementById('chat-active-panel').classList.remove('hidden');

    // Set Header
    document.getElementById('chat-active-name').innerText = name;
    document.getElementById('chat-active-trust').innerText = `Trust Score: ${trustScore || '750'}`;

    const placeholder = document.getElementById('chat-active-placeholder');
    const avatar = document.getElementById('chat-active-avatar');
    
    if (photo && photo.trim() !== '') {
        avatar.src = photo;
        avatar.classList.remove('hidden');
        placeholder.classList.add('hidden');
    } else {
        avatar.classList.add('hidden');
        placeholder.innerText = name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        placeholder.classList.remove('hidden');
    }

    // Update active highlight class in sidebar
    document.querySelectorAll('.chat-channel-item').forEach(btn => btn.classList.remove('active'));
    
    // Join the socket room for real-time messages
    if (socket) {
        socket.emit('join_room', { userId: state.user.id, peerId });
    }
    
    loadChatMessagesStream();
    loadChatConversations(); // refresh unread badges
}

async function loadChatMessagesStream() {
    if (!state.activeChatPeer) return;

    const stream = document.getElementById('chat-messages-stream');
    try {
        const history = await apiRequest(`/chat/history/${state.activeChatPeer}`);
        
        // Save scroll position
        const isNearBottom = stream.scrollHeight - stream.scrollTop - stream.clientHeight < 100;
        
        stream.innerHTML = '';
        
        if (history.length === 0) {
            stream.innerHTML = '<div class="text-center text-muted p-4" style="font-size:0.85rem;">Secure conversation channel opened. Send a message to start swapping!</div>';
            return;
        }

        history.forEach(m => {
            const isSent = m.senderId === state.user.id;
            const bubbleRow = document.createElement('div');
            bubbleRow.className = `chat-msg-row ${isSent ? 'sent' : ''}`;
            
            // Build media preview
            let mediaContent = '';
            if (m.mediaUrl) {
                if (m.mediaType === 'image') {
                    mediaContent = `<img src="${m.mediaUrl}" style="max-width:200px; border-radius:4px; margin-bottom:6px; display:block;" alt="Media preview">`;
                } else {
                    mediaContent = `<div style="padding:6px; background:rgba(0,0,0,0.2); border-radius:4px; margin-bottom:6px; display:flex; align-items:center; gap:6px; font-size:0.8rem;">
                        <i data-lucide="file-text" style="width:14px; height:14px;"></i>
                        <span>Attachment: Document file</span>
                    </div>`;
                }
            }

            // Reactions badges
            let reactionsHtml = '';
            if (m.reactions && Object.keys(m.reactions).length > 0) {
                reactionsHtml = `<div class="reactions-badge-wrapper">`;
                for (const [emoji, users] of Object.entries(m.reactions)) {
                    reactionsHtml += `<span class="reaction-badge" onclick="submitMessageReaction(${m.id}, '${emoji}')">${emoji} ${users.length}</span>`;
                }
                reactionsHtml += `</div>`;
            }

            bubbleRow.innerHTML = `
                <div class="chat-msg-bubble">
                    ${m.repliedToId ? `<div style="font-size:0.75rem; border-left:2px solid var(--color-primary); padding-left:6px; color:var(--text-secondary); margin-bottom:4px; font-style:italic;">Reply to message</div>` : ''}
                    ${mediaContent}
                    <div style="font-size:0.9rem; word-break:break-word;">${m.message || ''}</div>
                    
                    <div class="chat-msg-meta">
                        <span>${new Date(m.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        <button class="reaction-trigger-btn" onclick="submitMessageReaction(${m.id}, '👍')" title="Thumbs up">👍</button>
                        <button class="reaction-trigger-btn" onclick="triggerChatReply(${m.id}, '${m.message ? m.message.replace(/'/g, "\\'") : 'Media attachment'}')" title="Reply">Reply</button>
                    </div>
                    ${reactionsHtml}
                </div>
            `;
            stream.appendChild(bubbleRow);
        });

        // Scroll to bottom
        if (isNearBottom) {
            stream.scrollTop = stream.scrollHeight;
        }
        lucide.createIcons();
    } catch (e) {
        console.error('Chat load error:', e.message);
    }
}

function pollActiveChatStream() {
    if (state.activeTab === 'chat' && state.activeChatPeer) {
        loadChatMessagesStream();
    }
}

// Send chat message
async function handleSendChatMessage(event) {
    event.preventDefault();
    const input = document.getElementById('chat-message-input');
    const msg = input.value.trim();
    if (!msg && !activeChatFileBase64) return;

    try {
        const payload = {
            receiverId: state.activeChatPeer,
            message: msg,
            mediaUrl: activeChatFileBase64 || '',
            mediaType: activeChatFileType || '',
            repliedToId: state.repliedToMessageId
        };

        await apiRequest('/chat/message', 'POST', payload);
        
        input.value = '';
        cancelChatReply();

        // Stop typing indicator
        if (socket) {
            socket.emit('stop_typing', { senderId: state.user.id, receiverId: state.activeChatPeer });
        }

        // Emit message via socket for real-time delivery
        if (socket) {
            socket.emit('send_message', {
                senderId: state.user.id,
                receiverId: state.activeChatPeer,
                message: msg
            });
        }

        loadChatMessagesStream();
        loadChatConversations(); // refresh last messages
    } catch (e) {
        showToast(e.message, 'error');
    }
}

// Media file upload attachments logic
let activeChatFileBase64 = '';
let activeChatFileType = '';
function triggerChatFileSelect() {
    document.getElementById('chat-media-file').click();
}

function handleChatFileSelected(input) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            activeChatFileBase64 = e.target.result;
            activeChatFileType = file.type.startsWith('image/') ? 'image' : 'document';
            showToast(`Attachment selected: ${file.name}`, 'info');
        };
        reader.readAsDataURL(file);
    }
}

// Reply message toggle
function triggerChatReply(messageId, previewText) {
    state.repliedToMessageId = messageId;
    const bar = document.getElementById('chat-reply-bar');
    document.getElementById('chat-reply-preview-text').innerText = previewText.substring(0, 30) + (previewText.length > 30 ? '...' : '');
    bar.classList.remove('hidden');
}

function cancelChatReply() {
    state.repliedToMessageId = null;
    document.getElementById('chat-reply-bar').classList.add('hidden');
    activeChatFileBase64 = '';
    activeChatFileType = '';
}

// Submit message reactions
async function submitMessageReaction(messageId, emoji) {
    try {
        await apiRequest('/chat/react', 'POST', { messageId, emoji });
        loadChatMessagesStream();
    } catch (e) {
        showToast(e.message, 'error');
    }
}

// ==========================================
// TAB WORKFLOW: BOOKINGS & MEETINGS
// ==========================================

async function loadMeetingsList() {
    const grid = document.getElementById('scheduled-meetings-list');
    grid.innerHTML = '<div class="text-center p-3 text-muted">Loading meetings...</div>';
    
    try {
        const list = await apiRequest('/meetings');
        grid.innerHTML = '';
        
        const scheduled = list.filter(m => m.status === 'scheduled');
        if (scheduled.length === 0) {
            grid.innerHTML = `<div class="text-center text-muted p-4 col-span-2">No upcoming scheduled lessons. Select a partner to schedule!</div>`;
        } else {
            scheduled.forEach(m => {
                const card = document.createElement('div');
                card.className = 'peer-card p-3';
                card.innerHTML = `
                    <h4 class="text-primary">${m.skill} Session</h4>
                    <p class="small-info mt-1"><strong>Partner:</strong> ${m.peerName}</p>
                    <p class="small-info"><strong>Schedule:</strong> ${m.date} at ${m.time}</p>
                    <div style="display:flex; gap:8px; margin-top:12px;">
                        <a href="${m.meetLink}" target="_blank" class="btn btn-primary btn-small flex-1" style="text-align:center;">Join Meeting</a>
                        <button class="btn btn-secondary btn-small" onclick="completeSession(${m.id})">Complete</button>
                    </div>
                `;
                grid.appendChild(card);
            });
        }

        // Render ratings feedback reviews list
        const feedbackContainer = document.getElementById('pending-feedback-list');
        feedbackContainer.innerHTML = '';

        const completed = list.filter(m => m.status === 'completed' && !m.ratingSubmitted);
        if (completed.length === 0) {
            feedbackContainer.innerHTML = '<div class="text-center text-muted p-2" style="font-size:0.85rem;">No reviews pending feedback.</div>';
        } else {
            completed.forEach(m => {
                const item = document.createElement('div');
                item.className = 'notification-card';
                item.innerHTML = `
                    <i data-lucide="star" class="text-warning"></i>
                    <div style="flex:1;">
                        <div class="title">Review Session: ${m.skill}</div>
                        <div class="desc">Please rate your swap session with ${m.peerName}. Leaving feedback awards +15 Credits, +100 XP!</div>
                        <button class="btn btn-primary btn-small mt-2" onclick="openRatingModal(${m.id}, '${m.peerName}')">Submit Review</button>
                    </div>
                `;
                feedbackContainer.appendChild(item);
            });
        }
        
        // Update meetings sidebar notification badge count
        document.getElementById('meetings-badge-count').innerText = scheduled.length;
        if (scheduled.length > 0) {
            document.getElementById('meetings-badge-count').classList.remove('hidden');
        } else {
            document.getElementById('meetings-badge-count').classList.add('hidden');
        }
        lucide.createIcons();
    } catch (e) {
        grid.innerHTML = `<div class="text-center text-danger p-3">Error: ${e.message}</div>`;
    }
}

// Complete Session Action
async function completeSession(meetingId) {
    try {
        const data = await apiRequest(`/meetings/${meetingId}/complete`, 'POST');
        showToast(data.msg, 'success');
        loadMeetingsList();
    } catch (e) {
        showToast(e.message, 'error');
    }
}
// ==========================================
// SCHEDULE MEETING MODAL
// ==========================================

let scheduleConnections = []; // cache of accepted connections

async function openScheduleModal() {
    const partnerSelect = document.getElementById('schedule-partner');
    const skillSelect = document.getElementById('schedule-skill');
    
    partnerSelect.innerHTML = '<option value="">Loading partners...</option>';
    skillSelect.innerHTML = '<option value="">Select partner first</option>';
    
    document.getElementById('schedule-modal').classList.remove('hidden');
    lucide.createIcons();

    try {
        const reqData = await apiRequest('/requests');
        // Get accepted connections where user is sender or receiver
        const accepted = [...(reqData.received || []), ...(reqData.sent || [])].filter(r => r.status === 'accepted');
        
        scheduleConnections = accepted;
        partnerSelect.innerHTML = '<option value="">Choose a partner...</option>';
        
        if (accepted.length === 0) {
            partnerSelect.innerHTML = '<option value="">No accepted connections yet</option>';
            return;
        }

        // Deduplicate partners by peer name
        const seen = new Set();
        accepted.forEach(conn => {
            const peerId = conn.senderId === state.user.id ? conn.receiverId : conn.senderId;
            if (!seen.has(peerId)) {
                seen.add(peerId);
                const opt = document.createElement('option');
                opt.value = peerId;
                opt.innerText = conn.peerName;
                partnerSelect.appendChild(opt);
            }
        });
        
        // Listen for partner change to populate skills
        partnerSelect.onchange = () => updateScheduleSkills();
    } catch (e) {
        partnerSelect.innerHTML = '<option value="">Error loading partners</option>';
        showToast(e.message, 'error');
    }
}

function updateScheduleSkills() {
    const peerId = parseInt(document.getElementById('schedule-partner').value);
    const skillSelect = document.getElementById('schedule-skill');
    skillSelect.innerHTML = '';
    
    if (!peerId) {
        skillSelect.innerHTML = '<option value="">Select partner first</option>';
        return;
    }
    
    // Find the connection's skill and also offer common skills
    const conn = scheduleConnections.find(c => {
        const cPeerId = c.senderId === state.user.id ? c.receiverId : c.senderId;
        return cPeerId === peerId;
    });
    
    if (conn && conn.skill) {
        const opt = document.createElement('option');
        opt.value = conn.skill;
        opt.innerText = conn.skill;
        skillSelect.appendChild(opt);
    }
    
    // Add user's learning skills as additional options
    if (state.user.skillsLearn) {
        state.user.skillsLearn.forEach(skill => {
            if (!conn || skill !== conn.skill) {
                const opt = document.createElement('option');
                opt.value = skill;
                opt.innerText = skill;
                skillSelect.appendChild(opt);
            }
        });
    }
}

function closeScheduleModal() {
    document.getElementById('schedule-modal').classList.add('hidden');
}

async function handleScheduleSubmit(event) {
    event.preventDefault();
    
    const peerId = document.getElementById('schedule-partner').value;
    const skill = document.getElementById('schedule-skill').value;
    const date = document.getElementById('schedule-date').value;
    const time = document.getElementById('schedule-time').value;
    
    if (!peerId || !skill || !date || !time) {
        showToast('Please fill all scheduling fields.', 'error');
        return;
    }
    
    try {
        const data = await apiRequest('/meetings', 'POST', { peerId, skill, date, time });
        showToast(data.msg, 'success');
        
        // Update user profile (credits deducted)
        if (data.user) {
            state.user = data.user;
            updateMetricChips();
            updateSidebarProfile();
        }
        
        closeScheduleModal();
        loadMeetingsList();
    } catch (e) {
        showToast(e.message, 'error');
    }
}

// Ratings feedback modal trigger actions
function openRatingModal(meetingId, partnerName) {
    document.getElementById('rating-modal-meeting-id').value = meetingId;
    document.getElementById('rating-modal-partner-info').innerText = `How was your session with ${partnerName}?`;
    document.getElementById('rating-modal').classList.remove('hidden');
    setRatingValue(5); // default stars
}

function closeRatingModal() {
    document.getElementById('rating-modal').classList.add('hidden');
}

function setRatingValue(val) {
    state.selectedRatingValue = val;
    const buttons = document.querySelectorAll('.rating-stars-picker .star-btn');
    buttons.forEach((btn, idx) => {
        if (idx < val) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

async function submitRatingFeedback() {
    const meetingId = document.getElementById('rating-modal-meeting-id').value;
    const comment = document.getElementById('rating-comment').value;

    try {
        const data = await apiRequest(`/meetings/${meetingId}/rate`, 'POST', {
            rating: state.selectedRatingValue,
            comment
        });

        showToast(data.msg, 'success');
        state.user = data.user;
        updateMetricChips();
        updateSidebarProfile();

        closeRatingModal();
        loadMeetingsList();
        document.getElementById('rating-comment').value = '';
    } catch (e) {
        showToast(e.message, 'error');
    }
}

// ==========================================
// TAB WORKFLOW: AI CUSTOM LEARNING ROADMAPS
// ==========================================

async function handleRoadmapGenerate(event) {
    event.preventDefault();
    const skillInput = document.getElementById('roadmap-skill-input');
    const skill = skillInput.value.trim();
    if (!skill) return;

    const loader = document.getElementById('roadmap-loading');
    const resultBox = document.getElementById('roadmap-result-box');

    loader.classList.remove('hidden');
    resultBox.classList.add('hidden');

    try {
        const data = await apiRequest(`/ai/roadmap?skill=${encodeURIComponent(skill)}`);
        loader.classList.add('hidden');
        resultBox.classList.remove('hidden');

        document.getElementById('roadmap-title').innerText = `${data.roadmap.title} Path`;
        const container = document.getElementById('roadmap-timeline-container');
        container.innerHTML = '';

        data.roadmap.modules.forEach(m => {
            const card = document.createElement('div');
            card.className = 'roadmap-node';
            card.innerHTML = `
                <h4 style="color:#fff;">${m.title}</h4>
                <div class="text-secondary mt-1" style="font-size:0.9rem;"><strong>Focus Topics:</strong> ${m.topic}</div>
                <div class="text-accent mt-1" style="font-size:0.82rem;"><strong>Timeline:</strong> ${m.duration} | <strong>Projects:</strong> ${m.projects.join(', ')}</div>
            `;
            container.appendChild(card);
        });

        // Update user state metrics since XP was awarded
        await fetchUserProfile();
        showToast('AI Roadmap generated successfully (+50 XP)!', 'success');
    } catch (e) {
        loader.classList.add('hidden');
        showToast(e.message, 'error');
    }
}

// ==========================================
// TAB WORKFLOW: ADAPTIVE QUIZ VALIDATIONS
// ==========================================

async function loadAssessmentTracks() {
    const select = document.getElementById('assessment-skill-select');
    select.innerHTML = '<option value="">Loading tracks...</option>';

    try {
        const mcqs = await apiRequest('/progress/mcqs');
        select.innerHTML = '';
        Object.keys(mcqs).forEach(skill => {
            const opt = document.createElement('option');
            opt.value = skill;
            opt.innerText = skill;
            select.appendChild(opt);
        });
    } catch (e) {
        select.innerHTML = `<option value="">Error loading: ${e.message}</option>`;
    }
}

// Trigger adaptive assessment exam start
async function startAdaptiveAssessment() {
    const select = document.getElementById('assessment-skill-select');
    const skill = select.value;
    if (!skill) {
        showToast('Please select a skill track.', 'error');
        return;
    }

    try {
        const data = await apiRequest('/progress/assessment/start', 'POST', { skill });
        state.assessment.questions = data.questions;
        state.assessment.answers = [];
        state.assessment.currentIndex = 0;
        state.assessment.skill = skill;

        document.getElementById('assessment-setup-panel').classList.add('hidden');
        document.getElementById('assessment-active-panel').classList.remove('hidden');
        document.getElementById('quiz-skill-badge').innerText = `${skill} Adaptive Assessment`;

        renderAssessmentQuestion();
    } catch (e) {
        showToast(e.message, 'error');
    }
}

function renderAssessmentQuestion() {
    const currentQ = state.assessment.questions[state.assessment.currentIndex];
    
    document.getElementById('question-index-display').innerText = `Question ${state.assessment.currentIndex + 1} of ${state.assessment.questions.length}`;
    document.getElementById('question-difficulty-badge').innerText = currentQ.difficulty;
    document.getElementById('quiz-question-text').innerText = currentQ.q;

    // Update progress bar
    const fillPercent = ((state.assessment.currentIndex) / state.assessment.questions.length) * 100;
    document.getElementById('quiz-progress-indicator').style.width = `${fillPercent}%`;

    const wrapper = document.getElementById('quiz-options-wrapper');
    wrapper.innerHTML = '';

    currentQ.o.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-option-btn';
        btn.innerHTML = `<span style="font-weight:600; margin-right:8px;">${String.fromCharCode(65 + idx)}.</span> ${opt}`;
        btn.onclick = () => selectAssessmentOption(idx, btn);
        wrapper.appendChild(btn);
    });

    activeAssessmentSelection = null;
    document.getElementById('quiz-alert-hint').innerText = 'Select answer to proceed.';
}

let activeAssessmentSelection = null;
function selectAssessmentOption(idx, buttonElement) {
    activeAssessmentSelection = idx;
    const btns = document.querySelectorAll('#quiz-options-wrapper .quiz-option-btn');
    btns.forEach(b => b.classList.remove('selected'));
    
    buttonElement.classList.add('selected');
    document.getElementById('quiz-alert-hint').innerText = 'Answer selected. Ready to submit.';
}

async function submitAssessmentAnswer() {
    if (activeAssessmentSelection === null) {
        document.getElementById('quiz-alert-hint').innerText = '⚠️ Please choose an option.';
        return;
    }

    state.assessment.answers.push(activeAssessmentSelection);
    state.assessment.currentIndex++;

    if (state.assessment.currentIndex < state.assessment.questions.length) {
        renderAssessmentQuestion();
    } else {
        // Complete! Submit answers to server
        document.getElementById('assessment-active-panel').classList.add('hidden');
        try {
            const data = await apiRequest('/progress/assessment/submit', 'POST', {
                skill: state.assessment.skill,
                answers: state.assessment.answers
            });

            state.user = data.user;
            updateMetricChips();
            updateSidebarProfile();

            // Display results
            document.getElementById('assessment-result-panel').classList.remove('hidden');
            document.getElementById('result-title').innerText = data.results.certifiedLevel !== 'None' 
                ? 'Certification Passed!' 
                : 'Assessment Completed';
            document.getElementById('result-subtitle').innerText = data.results.certifiedLevel !== 'None'
                ? `You have successfully passed the evaluation and unlocked the certified badge.`
                : `Unfortunately, you scored ${data.results.score}%, which is below the certified pass limit.`;

            document.getElementById('result-score-percent').innerText = `${data.results.score}%`;
            document.getElementById('result-level').innerText = data.results.certifiedLevel;
            document.getElementById('result-correct-count').innerText = `${data.results.correctCount}/${data.results.totalQuestions}`;

            const iconWrap = document.getElementById('result-status-icon');
            if (data.results.certifiedLevel !== 'None') {
                iconWrap.className = 'status-icon-wrapper success';
                iconWrap.innerHTML = `<i data-lucide="award" style="width:48px; height:48px; color:var(--color-success);"></i>`;
                
                // Show certificate view
                const uid = 'CERT-' + Math.random().toString(36).substring(2, 8).toUpperCase();
                document.getElementById('certificate-graphic-wrap').classList.remove('hidden');
                document.getElementById('cert-uid-field').innerText = uid;
                document.getElementById('cert-user-name').innerText = state.user.name;
                document.getElementById('cert-skill-title').innerText = state.assessment.skill;
                document.getElementById('cert-level-name').innerText = data.results.certifiedLevel;
                document.getElementById('cert-issue-date').innerText = `Issued: ${new Date().toLocaleDateString()}`;
                
                // Update QR code link
                const qr = document.getElementById('cert-qr-code');
                qr.src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(window.location.origin + '/verify/' + uid)}`;
            } else {
                iconWrap.className = 'status-icon-wrapper error';
                iconWrap.innerHTML = `<i data-lucide="x-circle" style="width:48px; height:48px; color:var(--color-error);"></i>`;
                document.getElementById('certificate-graphic-wrap').classList.add('hidden');
            }

            showToast(data.msg, data.results.certifiedLevel !== 'None' ? 'success' : 'info');
            lucide.createIcons();
        } catch (e) {
            showToast(e.message, 'error');
        }
    }
}

function resetAssessmentSetup() {
    document.getElementById('assessment-result-panel').classList.add('hidden');
    document.getElementById('assessment-setup-panel').classList.remove('hidden');
    loadAssessmentTracks();
}

function printCertificate() {
    window.print();
}

// ==========================================
// TAB WORKFLOW: PROFILE MANAGEMENT
// ==========================================

function loadProfileForm() {
    document.getElementById('prof-name').value = state.user.name;
    document.getElementById('prof-study').value = state.user.studied || '';
    document.getElementById('prof-city').value = state.user.city || '';
    document.getElementById('prof-state').value = state.user.state || '';
    document.getElementById('prof-languages').value = state.user.languages.join(', ');
    
    document.getElementById('prof-skills-offer').value = state.user.skillsOffer.join(', ');
    document.getElementById('prof-skills-learn').value = state.user.skillsLearn.join(', ');

    const preview = document.getElementById('prof-photo-preview');
    preview.src = state.user.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';
    
    // Render certifications lists
    const certsWrapper = document.getElementById('profile-certifications-wrapper');
    certsWrapper.innerHTML = '';

    if (state.user.certifications.length === 0) {
        certsWrapper.innerHTML = '<div class="text-center text-muted p-2" style="font-size:0.85rem;">No verified certifications yet. Take assessments to earn badges.</div>';
    } else {
        state.user.certifications.forEach(c => {
            const card = document.createElement('div');
            card.className = 'cert-card';
            card.innerHTML = `
                <i data-lucide="award" class="text-primary" style="width:28px; height:28px;"></i>
                <div style="flex:1;">
                    <span style="font-weight:600; display:block; font-size:0.9rem;">${c.skill}</span>
                    <span style="font-size:0.75rem; color:var(--text-secondary); display:block;">Level: ${c.level} | Passed: ${c.date}</span>
                </div>
            `;
            certsWrapper.appendChild(card);
        });
    }
    lucide.createIcons();
}

async function handleProfileUpdate(event) {
    event.preventDefault();
    const name = document.getElementById('prof-name').value;
    const studied = document.getElementById('prof-study').value;
    const city = document.getElementById('prof-city').value;
    const stateVal = document.getElementById('prof-state').value;
    
    const languages = document.getElementById('prof-languages').value;
    const skillsOffer = document.getElementById('prof-skills-offer').value;
    const skillsLearn = document.getElementById('prof-skills-learn').value;

    try {
        const data = await apiRequest('/users/profile', 'PUT', {
            name, studied, city, state: stateVal,
            languages, skillsOffer, skillsLearn
        });

        state.user = data;
        updateSidebarProfile();
        updateMetricChips();
        updateOnboardingChecklist();
        showToast('Profile information updated successfully!', 'success');
    } catch (e) {
        showToast(e.message, 'error');
    }
}

// ==========================================
// DYNAMIC MOCK INTERVIEWS & ATS
// ==========================================

function switchCareerSubTab(sub) {
    const atsPane = document.getElementById('career-sub-ats');
    const interviewPane = document.getElementById('career-sub-interview');
    const tabs = document.querySelectorAll('.career-pane');

    if (sub === 'ats') {
        atsPane.classList.remove('hidden');
        interviewPane.classList.add('hidden');
    } else {
        atsPane.classList.add('hidden');
        interviewPane.classList.remove('hidden');
    }

    // Toggle active tab buttons
    const btns = document.querySelectorAll('#career-center-tabs button');
    if (btns.length >= 2) {
        if (sub === 'ats') {
            btns[0].classList.add('active');
            btns[1].classList.remove('active');
        } else {
            btns[0].classList.remove('active');
            btns[1].classList.add('active');
        }
    }
}

async function submitATSAnalysis() {
    const resumeText = document.getElementById('career-ats-text').value.trim();
    const targetSkill = document.getElementById('career-ats-skill').value;
    if (!resumeText) {
        showToast('Please insert resume text.', 'error');
        return;
    }

    try {
        const data = await apiRequest('/ai/resume', 'POST', { resumeText, targetSkill });
        document.getElementById('ats-result-box').classList.remove('hidden');
        document.getElementById('ats-score-percent').innerText = `${data.analysis.score}%`;
        
        const list = document.getElementById('ats-recs-list');
        list.innerHTML = '';
        data.analysis.recommendations.forEach(r => {
            list.innerHTML += `<div>• ${r}</div>`;
        });
        
        // Show missing keywords if any
        if (data.analysis.missingKeywords && data.analysis.missingKeywords.length > 0) {
            list.innerHTML += `<div class="mt-2 text-warning"><strong>Missing keywords:</strong> ${data.analysis.missingKeywords.join(', ')}</div>`;
        }

        showToast(data.msg, 'success');
        await fetchUserProfile(); // Update XP
    } catch (e) {
        showToast(e.message, 'error');
    }
}

// Mock interview operations
async function startMockInterview() {
    const skill = document.getElementById('career-mock-skill').value;
    const difficulty = document.getElementById('career-mock-diff').value;

    try {
        const data = await apiRequest('/ai/interview/start', 'POST', { skill, difficulty });
        
        state.mockInterview.questions = data.questions;
        state.mockInterview.answers = [];
        state.mockInterview.currentIndex = 0;
        state.mockInterview.skill = skill;
        state.mockInterview.difficulty = difficulty;

        document.getElementById('interview-setup-box').classList.add('hidden');
        document.getElementById('interview-console-box').classList.remove('hidden');
        
        renderInterviewQuestion();
    } catch (e) {
        showToast(e.message, 'error');
    }
}

function renderInterviewQuestion() {
    const idx = state.mockInterview.currentIndex;
    const q = state.mockInterview.questions[idx];

    document.getElementById('interview-q-index').innerText = `Question ${idx + 1} of ${state.mockInterview.questions.length}`;
    document.getElementById('interview-q-text').innerText = q;
    document.getElementById('interview-ans').value = '';
}

async function submitInterviewAnswer() {
    const ans = document.getElementById('interview-ans').value.trim();
    if (!ans) {
        showToast('Please type your response.', 'error');
        return;
    }

    state.mockInterview.answers.push(ans);
    state.mockInterview.currentIndex++;

    if (state.mockInterview.currentIndex < state.mockInterview.questions.length) {
        renderInterviewQuestion();
    } else {
        // Evaluate complete responses
        document.getElementById('interview-console-box').classList.add('hidden');
        try {
            const data = await apiRequest('/ai/interview/submit', 'POST', {
                answers: state.mockInterview.answers,
                questions: state.mockInterview.questions
            });

            document.getElementById('interview-result-box').classList.remove('hidden');
            document.getElementById('interview-overall-score').innerText = `${data.overallScore}%`;

            const details = document.getElementById('interview-details-box');
            details.innerHTML = '';
            data.evaluations.forEach(ev => {
                details.innerHTML += `
                    <div class="card p-3" style="background:rgba(255,255,255,0.01);">
                        <strong>Q: ${ev.question}</strong>
                        <div class="text-secondary mt-1">Your answer: "${ev.answer}"</div>
                        <div class="text-accent mt-1">Score: ${ev.score}% | Feedback: ${ev.feedback}</div>
                    </div>
                `;
            });

            showToast(data.msg, 'success');
            await fetchUserProfile(); // Update XP
        } catch (e) {
            showToast(e.message, 'error');
        }
    }
}

function resetInterviewConsole() {
    document.getElementById('interview-result-box').classList.add('hidden');
    document.getElementById('interview-setup-box').classList.remove('hidden');
}

// ==========================================
// TOAST NOTIFICATIONS — STACKING QUEUE
// ==========================================

function showToast(msg, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast-item';

    let iconName = 'check-circle';
    let colorClass = 'text-success';
    if (type === 'error') { iconName = 'alert-circle'; colorClass = 'text-danger'; }
    else if (type === 'info') { iconName = 'info'; colorClass = 'text-primary'; }

    toast.innerHTML = `
        <i data-lucide="${iconName}" class="${colorClass}" style="width:18px;height:18px;flex-shrink:0;"></i>
        <span>${msg}</span>
    `;

    container.appendChild(toast);
    lucide.createIcons();

    // Auto-remove after 4 seconds with exit animation
    setTimeout(() => {
        toast.classList.add('toast-exit');
        setTimeout(() => toast.remove(), 300);
    }, 4000);

    // Limit visible toasts to 5
    const items = container.querySelectorAll('.toast-item');
    if (items.length > 5) {
        items[0].remove();
    }
}

// ==========================================
// PUSH NOTIFICATIONS — SERVICE WORKER BRIDGE
// ==========================================

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

async function requestPushPermission() {
    const btn = document.getElementById('push-enable-btn');
    if (btn) btn.disabled = true;

    try {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            showToast('Push notifications were denied.', 'error');
            dismissPushBanner();
            return;
        }

        // Fetch VAPID public key from server
        const { key } = await apiRequest('/notifications/vapid-public-key');
        if (!key) throw new Error('VAPID public key not available');

        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(key)
        });

        // Save subscription to server
        await apiRequest('/notifications/subscribe', 'POST', { subscription });

        showToast('🔔 Daily reminders enabled!', 'success');
        dismissPushBanner();
    } catch (e) {
        console.error('Push subscription error:', e);
        showToast('Could not enable push notifications.', 'error');
        if (btn) btn.disabled = false;
    }
}

function dismissPushBanner() {
    const banner = document.getElementById('push-permission-banner');
    if (banner) banner.classList.add('hidden');
    localStorage.setItem('push_banner_dismissed', '1');
}

// Wire typing indicator emit when user types in chat input
document.addEventListener('DOMContentLoaded', () => {
    const chatInput = document.getElementById('chat-message-input');
    if (chatInput) {
        chatInput.addEventListener('input', () => {
            if (!socket || !state.activeChatPeer || !state.user) return;
            socket.emit('typing', { senderId: state.user.id, receiverId: state.activeChatPeer });
            clearTimeout(typingTimer);
            typingTimer = setTimeout(() => {
                socket.emit('stop_typing', { senderId: state.user.id, receiverId: state.activeChatPeer });
            }, 2000);
        });
    }
});

// ==========================================
// MOBILE SIDEBAR TOGGLE
// ==========================================

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const overlay = document.getElementById('sidebar-overlay');
    if (!sidebar) return;

    sidebar.classList.toggle('open');
    if (overlay) overlay.classList.toggle('active');
}

// ==========================================
// DARK / LIGHT THEME TOGGLE
// ==========================================

function toggleTheme() {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme');
    const next = current === 'light' ? 'dark' : 'light';
    
    html.setAttribute('data-theme', next);
    localStorage.setItem('nexskill_theme', next);

    // Update icon
    const icon = document.getElementById('theme-toggle-icon');
    if (icon) {
        icon.setAttribute('data-lucide', next === 'light' ? 'sun' : 'moon');
        lucide.createIcons();
    }
}

// Apply saved theme on load
(function applySavedTheme() {
    const saved = localStorage.getItem('nexskill_theme');
    if (saved) {
        document.documentElement.setAttribute('data-theme', saved);
        // Icon will be updated after DOM loads
        document.addEventListener('DOMContentLoaded', () => {
            const icon = document.getElementById('theme-toggle-icon');
            if (icon) {
                icon.setAttribute('data-lucide', saved === 'light' ? 'sun' : 'moon');
                lucide.createIcons();
            }
        });
    }
})();

// ==========================================
// PEER PROFILE MODAL
// ==========================================

function openPeerProfileModal(peer) {
    const content = document.getElementById('peer-profile-content');
    const defaultPhoto = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80';

    content.innerHTML = `
        <div class="peer-profile-hero">
            <img src="${peer.photo || defaultPhoto}" alt="${peer.name}">
            <div class="peer-hero-info">
                <h3>${peer.name}</h3>
                <div class="subtitle">${peer.study || 'Student'} ${peer.place ? '• ' + peer.place : ''}</div>
                <div class="subtitle" style="color:var(--color-warning); margin-top:4px;">Rating: ${peer.rating} ★ (${peer.ratingsCount} reviews)</div>
            </div>
        </div>
        <div class="peer-profile-stats">
            <div class="peer-profile-stat">
                <h4>${peer.matchScore}%</h4>
                <span>Match Score</span>
            </div>
            <div class="peer-profile-stat">
                <h4>${peer.trustScore || 750}</h4>
                <span>Trust Score</span>
            </div>
            <div class="peer-profile-stat">
                <h4>Lv ${peer.level || 1}</h4>
                <span>Level</span>
            </div>
        </div>
        <div class="peer-skills-section">
            <h4>Skills They Teach</h4>
            <div class="peer-skill-tags">
                ${peer.skillsOffer.map(s => `<span class="peer-skill-tag teach">${s}</span>`).join('')}
            </div>
        </div>
        <div class="peer-skills-section">
            <h4>Skills They Want to Learn</h4>
            <div class="peer-skill-tags">
                ${peer.skillsLearn.map(s => `<span class="peer-skill-tag learn">${s}</span>`).join('')}
            </div>
        </div>
        ${peer.matchReasoning && peer.matchReasoning.length ? `
        <div class="peer-skills-section">
            <h4>Why You Match</h4>
            <div class="reasoning-list" style="font-size:0.85rem; color:var(--text-secondary);">
                ${peer.matchReasoning.map(r => `<div style="margin-bottom:4px;">• ${r}</div>`).join('')}
            </div>
        </div>` : ''}
        <div class="modal-actions" style="margin-top:1.5rem;">
            <button class="btn btn-secondary" onclick="closePeerProfileModal()">Close</button>
            <button class="btn btn-primary" onclick="sendSwapRequest(${peer.id}, '${peer.skillsOffer[0]}'); closePeerProfileModal();">
                <i data-lucide="git-pull-request" style="width:14px;height:14px;"></i>
                Connect
            </button>
        </div>
    `;

    document.getElementById('peer-profile-modal').classList.remove('hidden');
    lucide.createIcons();
}

function closePeerProfileModal() {
    document.getElementById('peer-profile-modal').classList.add('hidden');
}

// ==========================================
// FEATURE: LEADERBOARD
// ==========================================

let leaderboardSortMode = 'xp';

async function loadLeaderboard(sortBy = 'xp') {
    leaderboardSortMode = sortBy;
    const container = document.getElementById('leaderboard-content');
    container.innerHTML = '<div class="text-center text-muted p-4">Loading leaderboard...</div>';

    // Update tab highlights
    const tabs = document.querySelectorAll('#leaderboard-tabs .auth-tab');
    tabs.forEach(t => t.classList.remove('active'));
    const activeIdx = sortBy === 'xp' ? 0 : sortBy === 'rating' ? 1 : 2;
    if (tabs[activeIdx]) tabs[activeIdx].classList.add('active');

    try {
        const data = await apiRequest(`/leaderboard?sort=${sortBy}`);
        
        if (!data || data.length === 0) {
            container.innerHTML = '<div class="text-center text-muted p-4">No leaderboard data yet. Start swapping skills!</div>';
            return;
        }

        const sortLabel = sortBy === 'xp' ? 'XP' : sortBy === 'rating' ? 'Rating' : 'Streak';
        
        let html = `<table class="leaderboard-table">
            <thead><tr>
                <th style="width:60px;">Rank</th>
                <th>User</th>
                <th>${sortLabel}</th>
                <th>Level</th>
            </tr></thead><tbody>`;

        data.forEach((user, idx) => {
            const rank = idx + 1;
            let rankClass = 'normal';
            if (rank === 1) rankClass = 'gold';
            else if (rank === 2) rankClass = 'silver';
            else if (rank === 3) rankClass = 'bronze';

            const defaultPhoto = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80';
            const valueDisplay = sortBy === 'xp' ? (user.xp || 0) : sortBy === 'rating' ? `${(user.rating || 5).toFixed(1)} ★` : `${user.streak || 0} days`;
            const isCurrentUser = state.user && user.id === state.user.id;

            html += `<tr${isCurrentUser ? ' style="background:rgba(139,92,246,0.08);"' : ''}>
                <td><div class="leaderboard-rank ${rankClass}">${rank}</div></td>
                <td>
                    <div class="leaderboard-user">
                        <img src="${user.photo || defaultPhoto}" alt="${user.name}">
                        <div>
                            <div style="font-weight:600;">${user.name}${isCurrentUser ? ' <span style="color:var(--color-primary); font-size:0.75rem;">(You)</span>' : ''}</div>
                            <div style="font-size:0.78rem; color:var(--text-muted);">${user.study || 'Student'}</div>
                        </div>
                    </div>
                </td>
                <td><strong>${valueDisplay}</strong></td>
                <td>Lv ${user.level || 1}</td>
            </tr>`;
        });

        html += '</tbody></table>';
        container.innerHTML = html;
    } catch (e) {
        container.innerHTML = `<div class="text-center text-danger p-4">Error loading leaderboard: ${e.message}</div>`;
    }
}

// ==========================================
// FEATURE: COMMUNITY FORUM
// ==========================================

let forumPostsCache = [];

async function loadForumPosts() {
    const container = document.getElementById('forum-posts-list');
    container.innerHTML = '<div class="text-center text-muted p-4">Loading discussions...</div>';

    // Hide detail view
    document.getElementById('forum-detail-card').classList.add('hidden');

    try {
        const data = await apiRequest('/forum/posts');
        forumPostsCache = data || [];
        
        if (forumPostsCache.length === 0) {
            container.innerHTML = '<div class="text-center text-muted p-4">No discussions yet. Start one!</div>';
            return;
        }

        container.innerHTML = '';
        forumPostsCache.forEach(post => {
            const card = document.createElement('div');
            card.className = 'forum-post-card';
            card.onclick = () => openForumDetail(post.id);
            
            const timeAgo = getTimeAgo(new Date(post.createdAt));
            
            card.innerHTML = `
                <div class="forum-post-header">
                    <img src="${post.authorPhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}" alt="${post.authorName}">
                    <div style="flex:1;">
                        <div style="font-weight:600; font-size:0.9rem;">${post.authorName}</div>
                        <div style="font-size:0.75rem; color:var(--text-muted);">${timeAgo}</div>
                    </div>
                    ${post.tag ? `<span class="forum-tag">${post.tag}</span>` : ''}
                </div>
                <h4 style="font-size:1rem; margin-bottom:6px;">${post.title}</h4>
                <p style="font-size:0.88rem; color:var(--text-secondary); display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">${post.body}</p>
                <div class="forum-post-meta">
                    <span><i data-lucide="message-circle" style="width:14px;height:14px;"></i> ${post.replyCount || 0} replies</span>
                    <span><i data-lucide="thumbs-up" style="width:14px;height:14px;"></i> ${post.likes || 0} likes</span>
                </div>
            `;
            container.appendChild(card);
        });

        lucide.createIcons();
    } catch (e) {
        container.innerHTML = `<div class="text-center text-danger p-4">Error: ${e.message}</div>`;
    }
}

async function openForumDetail(postId) {
    const container = document.getElementById('forum-detail-card');
    container.classList.remove('hidden');

    try {
        const data = await apiRequest(`/forum/posts/${postId}`);
        
        document.getElementById('forum-detail-title').innerText = data.post.title;
        document.getElementById('forum-reply-post-id').value = postId;

        const timeAgo = getTimeAgo(new Date(data.post.createdAt));
        document.getElementById('forum-detail-body').innerHTML = `
            <div class="forum-post-header" style="margin-bottom:12px;">
                <img src="${data.post.authorPhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}" alt="${data.post.authorName}">
                <div>
                    <div style="font-weight:600;">${data.post.authorName}</div>
                    <div style="font-size:0.75rem; color:var(--text-muted);">${timeAgo} ${data.post.tag ? '• ' + data.post.tag : ''}</div>
                </div>
            </div>
            <p style="font-size:0.92rem; line-height:1.6; color:var(--text-secondary);">${data.post.body}</p>
        `;

        // Render replies
        const repliesList = document.getElementById('forum-replies-list');
        repliesList.innerHTML = '';

        if (data.replies && data.replies.length > 0) {
            data.replies.forEach(reply => {
                const el = document.createElement('div');
                el.className = 'forum-reply-card';
                el.innerHTML = `
                    <div style="display:flex; align-items:center; gap:8px; margin-bottom:6px;">
                        <img src="${reply.authorPhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80'}" style="width:24px;height:24px;border-radius:50%;object-fit:cover;" alt="${reply.authorName}">
                        <strong style="font-size:0.85rem;">${reply.authorName}</strong>
                        <span style="font-size:0.72rem; color:var(--text-muted);">${getTimeAgo(new Date(reply.createdAt))}</span>
                    </div>
                    <p style="font-size:0.88rem; color:var(--text-secondary);">${reply.body}</p>
                `;
                repliesList.appendChild(el);
            });
        } else {
            repliesList.innerHTML = '<div class="text-muted" style="font-size:0.85rem;">No replies yet. Be the first to reply!</div>';
        }

        lucide.createIcons();
    } catch (e) {
        showToast(e.message, 'error');
    }
}

function closeForumDetail() {
    document.getElementById('forum-detail-card').classList.add('hidden');
}

function openNewPostModal() {
    document.getElementById('new-post-modal').classList.remove('hidden');
    lucide.createIcons();
}

function closeNewPostModal() {
    document.getElementById('new-post-modal').classList.add('hidden');
}

async function submitNewForumPost(event) {
    event.preventDefault();
    const title = document.getElementById('new-post-title').value.trim();
    const body = document.getElementById('new-post-body').value.trim();
    const tag = document.getElementById('new-post-tag').value;

    if (!title || !body) {
        showToast('Please fill in title and content.', 'error');
        return;
    }

    try {
        const data = await apiRequest('/forum/posts', 'POST', { title, body, tag });
        showToast(data.msg || 'Discussion posted!', 'success');
        closeNewPostModal();
        document.getElementById('new-post-title').value = '';
        document.getElementById('new-post-body').value = '';
        loadForumPosts();
    } catch (e) {
        showToast(e.message, 'error');
    }
}

async function submitForumReply(event) {
    event.preventDefault();
    const postId = document.getElementById('forum-reply-post-id').value;
    const body = document.getElementById('forum-reply-input').value.trim();

    if (!body) return;

    try {
        const data = await apiRequest(`/forum/posts/${postId}/reply`, 'POST', { body });
        showToast(data.msg || 'Reply posted!', 'success');
        document.getElementById('forum-reply-input').value = '';
        openForumDetail(postId); // Refresh
    } catch (e) {
        showToast(e.message, 'error');
    }
}

// Utility: time ago helper
function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return date.toLocaleDateString();
}
