/* ==========================================================================
   STATE MANAGEMENT & STORAGE
   ========================================================================== */
const API_BASE = '/api';
let jwtToken = localStorage.getItem('skillswap_token') || null;

let adminState = {
    currentUser: null,
    users: [],
    mcqs: {},
    requests: [],
    meetings: [],
    stats: {
        totalUsers: 0,
        avgTrust: 0,
        totalCredits: 0,
        totalRequests: 0,
        totalMeetings: 0
    },
    activeTab: 'overview',
    selectedMCQSkill: '',
    selectedMCQDifficulty: 'Beginner'
};

/* ==========================================================================
   API UTILITY
   ========================================================================== */
async function apiFetch(endpoint, options = {}) {
    if (!options.headers) {
        options.headers = {};
    }
    options.headers['Content-Type'] = 'application/json';
    if (jwtToken) {
        options.headers['Authorization'] = `Bearer ${jwtToken}`;
    }
    
    try {
        const res = await fetch(`${API_BASE}${endpoint}`, options);
        if (res.status === 401) {
            handleAdminLogout();
            throw new Error('Session expired or unauthorized. Please log in again.');
        }
        
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.msg || 'API Error');
        }
        return data;
    } catch (err) {
        console.error(`API Fetch Error [${endpoint}]:`, err.message);
        throw err;
    }
}

/* ==========================================================================
   INITIALIZATION & AUTHENTICATION
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
    checkAuthentication();
    lucide.createIcons();
});

async function checkAuthentication() {
    if (!jwtToken) {
        showLoginView();
        return;
    }

    try {
        // Fetch current user details to check role
        const user = await apiFetch('/users/profile');
        if (user && user.role === 'Admin') {
            adminState.currentUser = user;
            showPortalView();
            loadAllData();
        } else {
            showToast('Access denied: You must be an administrator.', 'error');
            handleAdminLogout();
        }
    } catch (err) {
        showToast(err.message, 'error');
        handleAdminLogout();
    }
}

function showLoginView() {
    document.getElementById('admin-login-view').classList.remove('hidden');
    document.getElementById('admin-portal-view').classList.add('hidden');
}

function showPortalView() {
    document.getElementById('admin-login-view').classList.add('hidden');
    document.getElementById('admin-portal-view').classList.remove('hidden');
    
    // Set Profile details in sidebar
    document.getElementById('admin-name').textContent = adminState.currentUser.name;
    if (adminState.currentUser.photo) {
        document.getElementById('admin-avatar').src = adminState.currentUser.photo.startsWith('http') || adminState.currentUser.photo.startsWith('data:')
            ? adminState.currentUser.photo 
            : `/${adminState.currentUser.photo}`;
    }
}

async function handleAdminLogin(event) {
    event.preventDefault();
    const email = document.getElementById('admin-login-email').value;
    const password = document.getElementById('admin-login-password').value;

    try {
        const response = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.msg || 'Authentication failed');
        }

        if (data.user.role !== 'Admin') {
            throw new Error('Access denied: Non-admin users are not permitted.');
        }

        jwtToken = data.token;
        localStorage.setItem('skillswap_token', jwtToken);
        adminState.currentUser = data.user;
        
        showPortalView();
        loadAllData();
        showToast('Authenticated successfully!', 'success');
    } catch (err) {
        showToast(err.message, 'error');
    }
}

function handleAdminLogout() {
    jwtToken = null;
    localStorage.removeItem('skillswap_token');
    adminState.currentUser = null;
    showLoginView();
}

/* ==========================================================================
   DATA LOADING
   ========================================================================== */
async function loadAllData() {
    try {
        await Promise.all([
            fetchUsers(),
            fetchMCQs(),
            fetchRequests(),
            fetchMeetings()
        ]);
        
        calculateStats();
        await fetchDiagnostics();
        renderActiveTab();
    } catch (err) {
        showToast('Error loading platform records: ' + err.message, 'error');
    }
}

async function fetchDiagnostics() {
    try {
        const data = await apiFetch('/ai/admin/diagnostics');
        
        // Render Diagnostics
        document.getElementById('diag-os').textContent = data.diagnostics.os;
        document.getElementById('diag-node').textContent = data.diagnostics.nodeVersion;
        document.getElementById('diag-uptime').textContent = data.diagnostics.uptime;
        document.getElementById('diag-memory').textContent = data.diagnostics.heapUsed;

        // Render Audit Logs
        const tbody = document.getElementById('admin-audit-logs');
        if (tbody) {
            tbody.innerHTML = '';
            if (data.auditLogs.length === 0) {
                tbody.innerHTML = '<tr><td colspan="3" style="text-align:center; color:var(--text-secondary);">No audit logs logged yet.</td></tr>';
            } else {
                data.auditLogs.forEach(log => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${new Date(log.createdAt).toLocaleTimeString()}</td>
                        <td>${log.userName || 'System'}</td>
                        <td>${log.action}</td>
                    `;
                    tbody.appendChild(tr);
                });
            }
        }
    } catch (err) {
        console.error('Diagnostics loading failed:', err.message);
    }
}

async function fetchUsers() {
    adminState.users = await apiFetch('/users/admin/list');
}

async function fetchMCQs() {
    adminState.mcqs = await apiFetch('/progress/mcqs');
    
    // Auto select first skill category if none selected
    const skills = Object.keys(adminState.mcqs);
    if (skills.length > 0 && !adminState.selectedMCQSkill) {
        adminState.selectedMCQSkill = skills[0];
        
        // Render filters drop-down
        const filterSelect = document.getElementById('mcq-filter-skill');
        filterSelect.innerHTML = skills.map(sk => `<option value="${sk}">${sk}</option>`).join('');
    }
}

async function fetchRequests() {
    const data = await apiFetch('/requests/admin/list');
    adminState.requests = data;
}

async function fetchMeetings() {
    const data = await apiFetch('/meetings/admin/list');
    adminState.meetings = data;
}

function calculateStats() {
    const totalUsers = adminState.users.length;
    const circulatingCredits = adminState.users.reduce((acc, curr) => acc + (curr.credits || 0), 0);
    
    const validRatings = adminState.users.filter(u => u.ratingsCount > 0);
    const avgTrust = totalUsers > 0 
        ? Math.round(adminState.users.reduce((acc, curr) => acc + (curr.trustScore || 0), 0) / totalUsers)
        : 750;

    adminState.stats = {
        totalUsers: totalUsers,
        avgTrust: avgTrust,
        totalCredits: circulatingCredits,
        totalRequests: adminState.requests.length,
        totalMeetings: adminState.meetings.length
    };

    // Render Stats
    document.getElementById('stat-total-users').textContent = adminState.stats.totalUsers;
    document.getElementById('stat-avg-trust').textContent = adminState.stats.avgTrust;
    document.getElementById('stat-total-credits').textContent = adminState.stats.totalCredits;
    document.getElementById('stat-total-requests').textContent = adminState.stats.totalRequests;
    document.getElementById('stat-total-meetings').textContent = adminState.stats.totalMeetings;
}

/* ==========================================================================
   NAVIGATION
   ========================================================================== */
function switchTab(tabId) {
    adminState.activeTab = tabId;
    
    // Update nav buttons active classes
    const navItems = document.querySelectorAll('.admin-nav-item');
    navItems.forEach(item => {
        if (item.getAttribute('onclick').includes(tabId)) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });

    // Hide all tabs
    const views = document.querySelectorAll('.admin-tab-view');
    views.forEach(view => view.classList.add('hidden'));

    // Show current tab
    const currentView = document.getElementById(`view-${tabId}`);
    if (currentView) currentView.classList.remove('hidden');

    // Update Header titles
    const viewTitle = document.getElementById('view-title');
    const viewSubtitle = document.getElementById('view-subtitle');

    switch (tabId) {
        case 'overview':
            viewTitle.textContent = 'Dashboard Overview';
            viewSubtitle.textContent = 'Platform analytics and metrics';
            break;
        case 'users':
            viewTitle.textContent = 'User Management';
            viewSubtitle.textContent = 'Search, register, modify, and delete customer accounts';
            break;
        case 'mcqs':
            viewTitle.textContent = 'Mock Assessment MCQs';
            viewSubtitle.textContent = 'Manage technical questions and certification tracks';
            break;
        case 'requests':
            viewTitle.textContent = 'Swap Requests';
            viewSubtitle.textContent = 'Monitor peer connection and skill swap requests';
            break;
        case 'meetings':
            viewTitle.textContent = 'Sessions & Meetings';
            viewSubtitle.textContent = 'Manage schedules, Google Meet coordinates, and peer feedback';
            break;
    }

    renderActiveTab();
}

function renderActiveTab() {
    switch (adminState.activeTab) {
        case 'overview':
            calculateStats();
            break;
        case 'users':
            renderUsersTable();
            break;
        case 'mcqs':
            renderMCQFilters();
            renderMCQs();
            break;
        case 'requests':
            renderRequestsTable();
            break;
        case 'meetings':
            renderMeetingsTable();
            break;
    }
    lucide.createIcons();
}

/* ==========================================================================
   USER MANAGEMENT
   ========================================================================== */
function renderUsersTable(filteredList = null) {
    const tbody = document.getElementById('users-table-body');
    const list = filteredList || adminState.users;

    if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">No user accounts found.</td></tr>`;
        return;
    }

    tbody.innerHTML = list.map(u => {
        const photoSrc = u.photo 
            ? (u.photo.startsWith('http') || u.photo.startsWith('data:') ? u.photo : `/${u.photo}`) 
            : null;
        
        const avatarHtml = photoSrc 
            ? `<img src="${photoSrc}" class="cell-avatar" alt="${u.name}">`
            : `<div class="cell-avatar-initials">${getUserInitials(u.name)}</div>`;

        const offerHtml = (u.skillsOffer || []).map(s => `<span class="badge user" style="margin-right: 3px; margin-bottom: 3px;">${s}</span>`).join('');
        const learnHtml = (u.skillsLearn || []).map(s => `<span class="badge admin" style="margin-right: 3px; margin-bottom: 3px;">${s}</span>`).join('');

        return `
            <tr>
                <td>
                    <div class="cell-user-info">
                        ${avatarHtml}
                        <div class="cell-user-details">
                            <span class="cell-user-name">${u.name}</span>
                            <span class="cell-user-email">${u.email}</span>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="cell-user-details">
                        <span class="cell-user-name">${u.studied || 'N/A'}</span>
                        <span class="cell-user-email">${u.city ? `${u.city}, ${u.state}` : 'N/A'}</span>
                    </div>
                </td>
                <td>
                    <span class="badge ${u.role === 'Admin' ? 'admin' : 'user'}">${u.role}</span>
                </td>
                <td>
                    <div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:4px;">Teaches:</div>
                    <div style="margin-bottom:6px;">${offerHtml || 'None'}</div>
                    <div style="font-size:0.75rem; color:var(--text-muted); margin-bottom:4px;">Learns:</div>
                    <div>${learnHtml || 'None'}</div>
                </td>
                <td>
                    <div class="cell-user-details">
                        <span class="cell-user-name"><i data-lucide="coins" style="width:12px; height:12px; display:inline; margin-right:4px;"></i>${u.credits} Credits</span>
                        <span class="cell-user-email"><i data-lucide="shield" style="width:12px; height:12px; display:inline; margin-right:4px;"></i>${u.trustScore} Trust Score</span>
                    </div>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon edit" onclick="openEditUserModal('${u.email}')" title="Edit Profile"><i data-lucide="edit"></i></button>
                        <button class="btn-icon delete" onclick="handleDeleteUser('${u.email}')" title="Delete Profile"><i data-lucide="trash-2"></i></button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function filterUsersTable() {
    const query = document.getElementById('user-search').value.toLowerCase().trim();
    if (!query) {
        renderUsersTable();
        lucide.createIcons();
        return;
    }

    const filtered = adminState.users.filter(u => {
        return u.name.toLowerCase().includes(query) || 
               u.email.toLowerCase().includes(query) || 
               (u.studied && u.studied.toLowerCase().includes(query));
    });

    renderUsersTable(filtered);
    lucide.createIcons();
}

function openAddUserModal() {
    document.getElementById('user-modal-title').textContent = 'Add New Platform Account';
    document.getElementById('user-submit-btn-text').textContent = 'Add Account';
    document.getElementById('user-form').reset();
    document.getElementById('user-id').value = '';
    document.getElementById('user-edit-email-key').value = '';
    
    // Password required when creating
    document.getElementById('user-password').required = true;
    document.getElementById('user-password-label').textContent = 'Password';
    document.getElementById('user-email').disabled = false;

    document.getElementById('user-modal').classList.remove('hidden');
}

function openEditUserModal(email) {
    const u = adminState.users.find(user => user.email === email);
    if (!u) return;

    document.getElementById('user-modal-title').textContent = 'Modify Platform Account';
    document.getElementById('user-submit-btn-text').textContent = 'Save Changes';
    
    document.getElementById('user-id').value = u.id;
    document.getElementById('user-edit-email-key').value = u.email; // track old email reference key
    document.getElementById('user-name').value = u.name;
    document.getElementById('user-email').value = u.email;
    
    // Password optional when editing
    document.getElementById('user-password').required = false;
    document.getElementById('user-password').placeholder = '•••••••• (Leave blank to keep unchanged)';
    document.getElementById('user-password-label').textContent = 'Change Password';
    
    document.getElementById('user-role').value = u.role;
    document.getElementById('user-study').value = u.studied || '';
    document.getElementById('user-city').value = u.city || '';
    document.getElementById('user-state').value = u.state || '';
    document.getElementById('user-credits').value = u.credits;
    document.getElementById('user-trust').value = u.trustScore;
    
    document.getElementById('user-languages').value = (u.languages || []).join(', ');
    document.getElementById('user-offer').value = (u.skillsOffer || []).join(', ');
    document.getElementById('user-learn').value = (u.skillsLearn || []).join(', ');

    document.getElementById('user-modal').classList.remove('hidden');
}

function closeUserModal() {
    document.getElementById('user-modal').classList.add('hidden');
}

async function handleUserSubmit(event) {
    event.preventDefault();

    const id = document.getElementById('user-id').value;
    const oldEmailKey = document.getElementById('user-edit-email-key').value;
    
    const payload = {
        name: document.getElementById('user-name').value,
        role: document.getElementById('user-role').value,
        studied: document.getElementById('user-study').value,
        city: document.getElementById('user-city').value,
        state: document.getElementById('user-state').value,
        credits: parseInt(document.getElementById('user-credits').value),
        trustScore: parseInt(document.getElementById('user-trust').value),
        languages: document.getElementById('user-languages').value,
        skillsOffer: document.getElementById('user-offer').value,
        skillsLearn: document.getElementById('user-learn').value
    };

    const password = document.getElementById('user-password').value;

    let url = '/users/admin/add';
    let method = 'POST';

    if (id) {
        // Edit mode
        url = `/users/admin/edit/${encodeURIComponent(oldEmailKey)}`;
        method = 'PUT';
        payload.newEmail = document.getElementById('user-email').value;
        if (password.trim() !== '') {
            payload.password = password;
        }
    } else {
        // Add mode
        payload.email = document.getElementById('user-email').value;
        payload.password = password;
    }

    try {
        const res = await apiFetch(url, {
            method: method,
            body: JSON.stringify(payload)
        });
        
        showToast(res.msg, 'success');
        closeUserModal();
        await fetchUsers();
        renderUsersTable();
        calculateStats();
        lucide.createIcons();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function handleDeleteUser(email) {
    if (email === adminState.currentUser.email) {
        showToast('You cannot delete your own admin account!', 'error');
        return;
    }

    if (!confirm(`Are you sure you want to permanently delete the profile of "${email}"? This will erase all their skills, requests, and meetings.`)) {
        return;
    }

    try {
        const res = await apiFetch(`/users/admin/delete/${encodeURIComponent(email)}`, {
            method: 'DELETE'
        });
        
        showToast(res.msg, 'success');
        await fetchUsers();
        renderUsersTable();
        calculateStats();
        lucide.createIcons();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

/* ==========================================================================
   MCQ MANAGEMENT
   ========================================================================== */
function renderMCQFilters() {
    const skills = Object.keys(adminState.mcqs);
    const filterSelect = document.getElementById('mcq-filter-skill');
    const selected = filterSelect.value || adminState.selectedMCQSkill;

    filterSelect.innerHTML = skills.map(sk => `
        <option value="${sk}" ${sk === selected ? 'selected' : ''}>${sk}</option>
    `).join('');
    
    if (skills.length > 0 && !adminState.selectedMCQSkill) {
        adminState.selectedMCQSkill = skills[0];
    }
}

function renderMCQs() {
    const skill = document.getElementById('mcq-filter-skill').value;
    const difficulty = document.getElementById('mcq-filter-difficulty').value;
    
    adminState.selectedMCQSkill = skill;
    adminState.selectedMCQDifficulty = difficulty;

    const container = document.getElementById('mcq-list-container');
    
    if (!skill || !adminState.mcqs[skill] || !adminState.mcqs[skill][difficulty]) {
        container.innerHTML = `<div class="text-center text-muted card p-4">No questions created for this category/track yet.</div>`;
        return;
    }

    const questions = adminState.mcqs[skill][difficulty];

    if (questions.length === 0) {
        container.innerHTML = `<div class="text-center text-muted card p-4">No questions created for this category/track yet.</div>`;
        return;
    }

    container.innerHTML = questions.map((q, idx) => {
        const optionsHtml = (q.o || []).map((opt, oIdx) => {
            const isCorrect = oIdx === parseInt(q.a);
            return `
                <div class="admin-mcq-option ${isCorrect ? 'correct' : ''}">
                    <span style="font-weight: 700;">${String.fromCharCode(65 + oIdx)}.</span>
                    <span>${opt}</span>
                    ${isCorrect ? '<i data-lucide="check" style="width:12px; height:12px; margin-left: auto;"></i>' : ''}
                </div>
            `;
        }).join('');

        return `
            <div class="admin-mcq-card">
                <div class="admin-mcq-header">
                    <div class="admin-mcq-question">
                        <span style="color:var(--color-primary); font-weight:700; margin-right: 6px;">Q${idx + 1}.</span>
                        <span>${q.q}</span>
                    </div>
                    <div class="action-buttons">
                        <button class="btn-icon edit" onclick="openEditMCQModal(${idx})" title="Edit Question"><i data-lucide="edit"></i></button>
                        <button class="btn-icon delete" onclick="handleDeleteMCQ(${idx})" title="Delete Question"><i data-lucide="trash-2"></i></button>
                    </div>
                </div>
                <div class="admin-mcq-options">
                    ${optionsHtml}
                </div>
            </div>
        `;
    }).join('');
}

function openAddSkillModal() {
    document.getElementById('skill-form').reset();
    document.getElementById('skill-modal').classList.remove('hidden');
}

function closeAddSkillModal() {
    document.getElementById('skill-modal').classList.add('hidden');
}

async function handleSkillSubmit(event) {
    event.preventDefault();
    const skillName = document.getElementById('skill-name').value.trim();

    try {
        const res = await apiFetch('/progress/mcqs/track', {
            method: 'POST',
            body: JSON.stringify({ skillName })
        });
        
        showToast(res.msg, 'success');
        closeAddSkillModal();
        adminState.selectedMCQSkill = skillName;
        await fetchMCQs();
        renderActiveTab();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

function openAddMCQModal() {
    document.getElementById('mcq-modal-title').textContent = 'Add Technical MCQ Question';
    document.getElementById('mcq-submit-btn-text').textContent = 'Save Question';
    document.getElementById('mcq-form').reset();
    document.getElementById('mcq-index').value = '-1';
    document.getElementById('mcq-modal').classList.remove('hidden');
}

function openEditMCQModal(index) {
    const skill = adminState.selectedMCQSkill;
    const difficulty = adminState.selectedMCQDifficulty;
    const q = adminState.mcqs[skill][difficulty][index];
    if (!q) return;

    document.getElementById('mcq-modal-title').textContent = 'Modify MCQ Question';
    document.getElementById('mcq-submit-btn-text').textContent = 'Update Question';
    
    document.getElementById('mcq-index').value = index;
    document.getElementById('mcq-q').value = q.q;
    document.getElementById('mcq-o0').value = q.o[0] || '';
    document.getElementById('mcq-o1').value = q.o[1] || '';
    document.getElementById('mcq-o2').value = q.o[2] || '';
    document.getElementById('mcq-o3').value = q.o[3] || '';
    document.getElementById('mcq-a').value = q.a;

    document.getElementById('mcq-modal').classList.remove('hidden');
}

function closeAddMCQModal() {
    document.getElementById('mcq-modal').classList.add('hidden');
}

async function handleMCQSubmit(event) {
    event.preventDefault();

    const index = parseInt(document.getElementById('mcq-index').value);
    const skill = adminState.selectedMCQSkill;
    const difficulty = adminState.selectedMCQDifficulty;

    const payload = {
        skill,
        difficulty,
        index,
        question: {
            q: document.getElementById('mcq-q').value.trim(),
            o: [
                document.getElementById('mcq-o0').value.trim(),
                document.getElementById('mcq-o1').value.trim(),
                document.getElementById('mcq-o2').value.trim(),
                document.getElementById('mcq-o3').value.trim()
            ],
            a: parseInt(document.getElementById('mcq-a').value)
        }
    };

    try {
        const res = await apiFetch('/progress/mcqs/question', {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        showToast(res.msg, 'success');
        closeAddMCQModal();
        await fetchMCQs();
        renderMCQs();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function handleDeleteMCQ(index) {
    const skill = adminState.selectedMCQSkill;
    const difficulty = adminState.selectedMCQDifficulty;

    if (!confirm('Are you sure you want to permanently delete this MCQ assessment question?')) return;

    try {
        const res = await apiFetch('/progress/mcqs/question', {
            method: 'DELETE',
            body: JSON.stringify({ skill, difficulty, index })
        });

        showToast(res.msg, 'success');
        await fetchMCQs();
        renderMCQs();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

/* ==========================================================================
   SWAP REQUESTS MANAGEMENT
   ========================================================================== */
function renderRequestsTable() {
    const tbody = document.getElementById('requests-table-body');
    const list = adminState.requests;

    if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">No connection requests recorded on the platform.</td></tr>`;
        return;
    }

    tbody.innerHTML = list.map(r => {
        const senderPhoto = r.senderPhoto 
            ? (r.senderPhoto.startsWith('http') || r.senderPhoto.startsWith('data:') ? r.senderPhoto : `/${r.senderPhoto}`) 
            : null;
        const receiverPhoto = r.receiverPhoto 
            ? (r.receiverPhoto.startsWith('http') || r.receiverPhoto.startsWith('data:') ? r.receiverPhoto : `/${r.receiverPhoto}`) 
            : null;

        const senderAvatar = senderPhoto 
            ? `<img src="${senderPhoto}" class="cell-avatar" alt="${r.senderName}">`
            : `<div class="cell-avatar-initials">${getUserInitials(r.senderName)}</div>`;

        const receiverAvatar = receiverPhoto 
            ? `<img src="${receiverPhoto}" class="cell-avatar" alt="${r.receiverName}">`
            : `<div class="cell-avatar-initials">${getUserInitials(r.receiverName)}</div>`;

        const dateStr = new Date(r.createdAt).toLocaleDateString();

        return `
            <tr>
                <td>
                    <div class="cell-user-info">
                        ${senderAvatar}
                        <div class="cell-user-details">
                            <span class="cell-user-name">${r.senderName}</span>
                            <span class="cell-user-email">${r.senderEmail}</span>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="cell-user-info">
                        ${receiverAvatar}
                        <div class="cell-user-details">
                            <span class="cell-user-name">${r.receiverName}</span>
                            <span class="cell-user-email">${r.receiverEmail}</span>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="badge user">${r.skill}</span>
                </td>
                <td>
                    <span class="badge ${r.status}">${r.status}</span>
                </td>
                <td>
                    <span>${dateStr}</span>
                </td>
                <td>
                    <button class="btn-icon delete" onclick="handleDeleteRequest(${r.id})" title="Delete Swap Request"><i data-lucide="trash-2"></i></button>
                </td>
            </tr>
        `;
    }).join('');
}

async function handleDeleteRequest(id) {
    if (!confirm('Are you sure you want to delete this swap request? This action will remove the record entirely.')) return;

    try {
        const res = await apiFetch(`/requests/admin/${id}`, {
            method: 'DELETE'
        });

        showToast(res.msg, 'success');
        await fetchRequests();
        renderRequestsTable();
        calculateStats();
        lucide.createIcons();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

/* ==========================================================================
   SESSIONS & MEETINGS MANAGEMENT
   ========================================================================== */
function renderMeetingsTable() {
    const tbody = document.getElementById('meetings-table-body');
    const list = adminState.meetings;

    if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted">No scheduled 1-on-1 swap sessions.</td></tr>`;
        return;
    }

    tbody.innerHTML = list.map(m => {
        const senderPhoto = m.senderPhoto 
            ? (m.senderPhoto.startsWith('http') || m.senderPhoto.startsWith('data:') ? m.senderPhoto : `/${m.senderPhoto}`) 
            : null;
        const receiverPhoto = m.receiverPhoto 
            ? (m.receiverPhoto.startsWith('http') || m.receiverPhoto.startsWith('data:') ? m.receiverPhoto : `/${m.receiverPhoto}`) 
            : null;

        const senderAvatar = senderPhoto 
            ? `<img src="${senderPhoto}" class="cell-avatar" alt="${m.senderName}">`
            : `<div class="cell-avatar-initials">${getUserInitials(m.senderName)}</div>`;

        const receiverAvatar = receiverPhoto 
            ? `<img src="${receiverPhoto}" class="cell-avatar" alt="${m.receiverName}">`
            : `<div class="cell-avatar-initials">${getUserInitials(m.receiverName)}</div>`;

        const ratingInfo = m.ratingSubmitted 
            ? `<div style="font-weight: 700; color: var(--color-warning);">${'★'.repeat(m.starRating)}</div><div style="font-size: 0.75rem; color: var(--text-muted); max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${m.feedbackComment}">${m.feedbackComment}</div>`
            : '<span class="text-muted" style="font-size: 0.8rem;">No rating yet</span>';

        return `
            <tr>
                <td>
                    <div class="cell-user-info">
                        ${senderAvatar}
                        <div class="cell-user-details">
                            <span class="cell-user-name">${m.senderName}</span>
                            <span class="cell-user-email">${m.senderEmail}</span>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="cell-user-info">
                        ${receiverAvatar}
                        <div class="cell-user-details">
                            <span class="cell-user-name">${m.receiverName}</span>
                            <span class="cell-user-email">${m.receiverEmail}</span>
                        </div>
                    </div>
                </td>
                <td>
                    <span class="badge user">${m.skill}</span>
                </td>
                <td>
                    <div class="cell-user-details">
                        <span class="cell-user-name">${m.date}</span>
                        <span class="cell-user-email">${m.time}</span>
                    </div>
                </td>
                <td>
                    <a href="${m.meetLink}" target="_blank" class="small-info" style="color:var(--color-primary); display:flex; align-items:center; gap:4px; text-decoration:none;">
                        <i data-lucide="video" style="width:12px; height:12px;"></i> Join Meet
                    </a>
                </td>
                <td>
                    <span class="badge ${m.status}">${m.status}</span>
                </td>
                <td>
                    ${ratingInfo}
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-icon edit" onclick="openEditMeetingModal(${m.id})" title="Edit Details"><i data-lucide="edit"></i></button>
                        <button class="btn-icon delete" onclick="handleDeleteMeeting(${m.id})" title="Cancel & Delete Session"><i data-lucide="trash-2"></i></button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function openEditMeetingModal(id) {
    const m = adminState.meetings.find(meet => meet.id === id);
    if (!m) return;

    document.getElementById('meeting-id').value = m.id;
    document.getElementById('meeting-date').value = m.date;
    document.getElementById('meeting-time').value = m.time;
    document.getElementById('meeting-meetLink').value = m.meetLink;
    document.getElementById('meeting-status').value = m.status;

    document.getElementById('meeting-modal').classList.remove('hidden');
}

function closeMeetingModal() {
    document.getElementById('meeting-modal').classList.add('hidden');
}

async function handleMeetingSubmit(event) {
    event.preventDefault();

    const id = document.getElementById('meeting-id').value;
    const payload = {
        date: document.getElementById('meeting-date').value,
        time: document.getElementById('meeting-time').value,
        meetLink: document.getElementById('meeting-meetLink').value,
        status: document.getElementById('meeting-status').value
    };

    try {
        const res = await apiFetch(`/meetings/admin/${id}`, {
            method: 'PUT',
            body: JSON.stringify(payload)
        });

        showToast(res.msg, 'success');
        closeMeetingModal();
        await fetchMeetings();
        renderMeetingsTable();
        lucide.createIcons();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

async function handleDeleteMeeting(id) {
    if (!confirm('Are you sure you want to permanently cancel and delete this meeting session?')) return;

    try {
        const res = await apiFetch(`/meetings/admin/${id}`, {
            method: 'DELETE'
        });

        showToast(res.msg, 'success');
        await fetchMeetings();
        renderMeetingsTable();
        calculateStats();
        lucide.createIcons();
    } catch (err) {
        showToast(err.message, 'error');
    }
}

/* ==========================================================================
   HELPER UTILITIES
   ========================================================================== */
function getUserInitials(name) {
    if (!name) return '??';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function showToast(message, type = 'success') {
    const toast = document.getElementById('toast-notification');
    const msg = document.getElementById('toast-msg');
    const icon = document.getElementById('toast-icon');

    msg.textContent = message;

    if (type === 'error') {
        toast.className = 'toast show error';
        icon.setAttribute('data-lucide', 'alert-circle');
    } else {
        toast.className = 'toast show success';
        icon.setAttribute('data-lucide', 'check-circle');
    }

    lucide.createIcons();

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.classList.add('hidden'), 300);
    }, 4000);
}
