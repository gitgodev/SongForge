// =========================================
// AUTHENTICATION SYSTEM FOR SONGFORGE
// =========================================

// Auth state
window.SongForge = window.SongForge || {};
window.SongForge.auth = {
    currentUser: null,
    isLoggedIn: false,
    users: [],
    skipSignIn: true // Temporarily skip sign-in
};

// Encryption utility (simple for demo - use stronger encryption in production)
class SimpleEncryption {
    static encode(text) {
        return btoa(encodeURIComponent(text));
    }
    
    static decode(encoded) {
        try {
            return decodeURIComponent(atob(encoded));
        } catch (e) {
            return null;
        }
    }
    
    static hash(password) {
        // Simple hash - use proper hashing in production
        let hash = 0;
        for (let i = 0; i < password.length; i++) {
            const char = password.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash.toString();
    }
}

// =========================================
// USER MANAGEMENT
// =========================================

/**
 * Initialize authentication system
 */
function initializeAuth() {
    loadUsersFromStorage();
    
    // Check if user wants to skip sign-in
    if (window.SongForge.auth.skipSignIn) {
        setGuestUser();
        showDashboard();
        return;
    }
    
    // Check for existing session
    const savedSession = loadFromStorage('user-session');
    if (savedSession && savedSession.userId) {
        const user = findUserById(savedSession.userId);
        if (user) {
            loginUser(user);
            return;
        }
    }
    
    // Show welcome screen for new users
    showWelcomeScreen();
}

/**
 * Set guest user for skip sign-in mode
 */
function setGuestUser() {
    window.SongForge.auth.currentUser = {
        id: 'guest',
        username: 'Guest User',
        email: 'guest@songforge.local',
        isGuest: true,
        projects: [],
        createdAt: new Date().toISOString()
    };
    window.SongForge.auth.isLoggedIn = true;
    updateUIForUser();
}

/**
 * Load users from encrypted storage
 */
function loadUsersFromStorage() {
    const encryptedUsers = loadFromStorage('users-data');
    if (encryptedUsers) {
        try {
            const decryptedData = SimpleEncryption.decode(encryptedUsers);
            window.SongForge.auth.users = JSON.parse(decryptedData) || [];
        } catch (error) {
            console.warn('Failed to load users:', error);
            window.SongForge.auth.users = [];
        }
    }
}

/**
 * Save users to encrypted storage
 */
function saveUsersToStorage() {
    try {
        const userData = JSON.stringify(window.SongForge.auth.users);
        const encryptedData = SimpleEncryption.encode(userData);
        saveToStorage('users-data', encryptedData);
    } catch (error) {
        console.error('Failed to save users:', error);
    }
}

/**
 * Register new user
 */
function registerUser(username, email, password) {
    // Validate input
    if (!username || !email || !password) {
        throw new Error('All fields are required');
    }
    
    if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
    }
    
    // Check if user already exists
    if (window.SongForge.auth.users.find(u => u.email === email)) {
        throw new Error('User with this email already exists');
    }
    
    // Create new user
    const newUser = {
        id: generateId(),
        username: username.trim(),
        email: email.toLowerCase().trim(),
        passwordHash: SimpleEncryption.hash(password),
        projects: [],
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
    };
    
    window.SongForge.auth.users.push(newUser);
    saveUsersToStorage();
    
    return newUser;
}

/**
 * Login user
 */
function loginUser(user) {
    window.SongForge.auth.currentUser = user;
    window.SongForge.auth.isLoggedIn = true;
    
    // Update last login
    user.lastLogin = new Date().toISOString();
    saveUsersToStorage();
    
    // Save session
    saveToStorage('user-session', { userId: user.id });
    
    updateUIForUser();
    showDashboard();
}

/**
 * Logout user
 */
function logoutUser() {
    window.SongForge.auth.currentUser = null;
    window.SongForge.auth.isLoggedIn = false;
    
    // Clear session
    removeFromStorage('user-session');
    
    updateUIForUser();
    showWelcomeScreen();
}

/**
 * Find user by ID
 */
function findUserById(userId) {
    return window.SongForge.auth.users.find(u => u.id === userId);
}

/**
 * Find user by email
 */
function findUserByEmail(email) {
    return window.SongForge.auth.users.find(u => u.email === email.toLowerCase());
}

// =========================================
// UI UPDATES
// =========================================

/**
 * Update UI based on current user
 */
function updateUIForUser() {
    const usernameDisplay = document.getElementById('usernameDisplay');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (window.SongForge.auth.isLoggedIn && window.SongForge.auth.currentUser) {
        if (usernameDisplay) {
            usernameDisplay.textContent = window.SongForge.auth.currentUser.username;
            usernameDisplay.classList.remove('hidden');
        }
        
        if (loginBtn) loginBtn.classList.add('hidden');
        if (registerBtn) registerBtn.classList.add('hidden');
        if (logoutBtn) logoutBtn.classList.remove('hidden');
    } else {
        if (usernameDisplay) {
            usernameDisplay.textContent = 'Guest';
            usernameDisplay.classList.add('hidden');
        }
        
        if (loginBtn) loginBtn.classList.remove('hidden');
        if (registerBtn) registerBtn.classList.remove('hidden');
        if (logoutBtn) logoutBtn.classList.add('hidden');
    }
}

// =========================================
// MODAL DIALOGS
// =========================================

/**
 * Show login modal
 */
function showLoginModal() {
    const content = `
        <div class="space-y-4">
            <h3 class="text-lg font-semibold">Sign In</h3>
            
            <div>
                <label class="block text-sm font-medium mb-1">Email</label>
                <input type="email" id="loginEmail" placeholder="your@email.com" 
                       class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-base">
            </div>
            
            <div>
                <label class="block text-sm font-medium mb-1">Password</label>
                <input type="password" id="loginPassword" placeholder="Enter password" 
                       class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-base">
            </div>
            
            <div id="loginError" class="hidden text-red-500 text-sm"></div>
            
            <div class="flex space-x-3">
                <button onclick="processLogin()" 
                        class="flex-1 bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-lg transition-colors">
                    Sign In
                </button>
                <button onclick="showRegisterModal()" 
                        class="flex-1 bg-secondary hover:bg-secondary-dark text-white py-2 px-4 rounded-lg transition-colors">
                    Register
                </button>
            </div>
            
            <div class="text-center">
                <button onclick="skipSignIn()" 
                        class="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                    Continue as Guest
                </button>
            </div>
        </div>
    `;
    
    showModal('Welcome Back', content, { showClose: true });
}

/**
 * Show register modal
 */
function showRegisterModal() {
    const content = `
        <div class="space-y-4">
            <h3 class="text-lg font-semibold">Create Account</h3>
            
            <div>
                <label class="block text-sm font-medium mb-1">Username</label>
                <input type="text" id="registerUsername" placeholder="Your name" 
                       class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-base">
            </div>
            
            <div>
                <label class="block text-sm font-medium mb-1">Email</label>
                <input type="email" id="registerEmail" placeholder="your@email.com" 
                       class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-base">
            </div>
            
            <div>
                <label class="block text-sm font-medium mb-1">Password</label>
                <input type="password" id="registerPassword" placeholder="At least 6 characters" 
                       class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-base">
            </div>
            
            <div>
                <label class="block text-sm font-medium mb-1">Confirm Password</label>
                <input type="password" id="confirmPassword" placeholder="Re-enter password" 
                       class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-base">
            </div>
            
            <div id="registerError" class="hidden text-red-500 text-sm"></div>
            
            <div class="flex space-x-3">
                <button onclick="processRegistration()" 
                        class="flex-1 bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-lg transition-colors">
                    Create Account
                </button>
                <button onclick="showLoginModal()" 
                        class="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors">
                    Back to Login
                </button>
            </div>
            
            <div class="text-center">
                <button onclick="skipSignIn()" 
                        class="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                    Continue as Guest
                </button>
            </div>
        </div>
    `;
    
    showModal('Join SongForge', content, { showClose: true });
}

/**
 * Process login
 */
function processLogin() {
    const email = document.getElementById('loginEmail')?.value;
    const password = document.getElementById('loginPassword')?.value;
    const errorDiv = document.getElementById('loginError');
    
    try {
        if (!email || !password) {
            throw new Error('Please enter both email and password');
        }
        
        const user = findUserByEmail(email);
        if (!user) {
            throw new Error('User not found');
        }
        
        const passwordHash = SimpleEncryption.hash(password);
        if (user.passwordHash !== passwordHash) {
            throw new Error('Invalid password');
        }
        
        loginUser(user);
        closeModal();
        showNotification('Welcome back!', 'success');
        
    } catch (error) {
        if (errorDiv) {
            errorDiv.textContent = error.message;
            errorDiv.classList.remove('hidden');
        }
    }
}

/**
 * Process registration
 */
function processRegistration() {
    const username = document.getElementById('registerUsername')?.value;
    const email = document.getElementById('registerEmail')?.value;
    const password = document.getElementById('registerPassword')?.value;
    const confirmPassword = document.getElementById('confirmPassword')?.value;
    const errorDiv = document.getElementById('registerError');
    
    try {
        if (!username || !email || !password || !confirmPassword) {
            throw new Error('Please fill in all fields');
        }
        
        if (password !== confirmPassword) {
            throw new Error('Passwords do not match');
        }
        
        const newUser = registerUser(username, email, password);
        loginUser(newUser);
        closeModal();
        showNotification('Account created successfully!', 'success');
        
    } catch (error) {
        if (errorDiv) {
            errorDiv.textContent = error.message;
            errorDiv.classList.remove('hidden');
        }
    }
}

/**
 * Skip sign in and continue as guest
 */
function skipSignIn() {
    closeModal();
    setGuestUser();
    showDashboard();
    showNotification('Continuing as guest', 'info');
}

// =========================================
// PROJECT MANAGEMENT FOR USERS
// =========================================

/**
 * Save project for current user
 */
function saveProjectForUser(projectData) {
    if (!window.SongForge.auth.currentUser) return false;
    
    const user = window.SongForge.auth.currentUser;
    
    if (user.isGuest) {
        // For guests, save to local storage only
        return saveToStorage('guest-projects', [projectData]);
    } else {
        // For registered users, save to user's project list
        if (!user.projects) user.projects = [];
        
        const existingIndex = user.projects.findIndex(p => p.id === projectData.id);
        if (existingIndex >= 0) {
            user.projects[existingIndex] = projectData;
        } else {
            user.projects.push(projectData);
        }
        
        saveUsersToStorage();
        return true;
    }
}

/**
 * Get projects for current user
 */
function getProjectsForUser() {
    if (!window.SongForge.auth.currentUser) return [];
    
    const user = window.SongForge.auth.currentUser;
    
    if (user.isGuest) {
        // For guests, load from local storage
        return loadFromStorage('guest-projects') || [];
    } else {
        // For registered users, return user's projects
        return user.projects || [];
    }
}

// =========================================
// EVENT LISTENERS
// =========================================

/**
 * Setup auth event listeners
 */
function setupAuthEventListeners() {
    // User menu toggle
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userDropdown = document.getElementById('userDropdown');
    
    if (userMenuBtn && userDropdown) {
        userMenuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle('hidden');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            userDropdown.classList.add('hidden');
        });
    }
    
    // Auth buttons
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const welcomeLoginBtn = document.getElementById('welcomeLoginBtn');
    
    if (loginBtn) loginBtn.addEventListener('click', showLoginModal);
    if (registerBtn) registerBtn.addEventListener('click', showRegisterModal);
    if (logoutBtn) logoutBtn.addEventListener('click', logoutUser);
    if (welcomeLoginBtn) welcomeLoginBtn.addEventListener('click', showLoginModal);
}

// Make functions globally available
window.showLoginModal = showLoginModal;
window.showRegisterModal = showRegisterModal;
window.processLogin = processLogin;
window.processRegistration = processRegistration;
window.skipSignIn = skipSignIn;

console.log('Auth system initialized');
