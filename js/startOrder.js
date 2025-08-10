// =========================================
// STARTUP SAFETY FOR SONGFORGE
// =========================================

// Global error handler
window.addEventListener('error', function(event) {
    console.error('Global error:', event.error);
    
    // Show user-friendly error message
    if (!document.querySelector('.error-notification')) {
        showSafeNotification('An error occurred. The app will continue to work with basic functionality.', 'error');
    }
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
    event.preventDefault(); // Prevent browser console error
});

/**
 * Safe notification function that works even if main notification system fails
 */
function showSafeNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelectorAll('.safe-notification');
    existing.forEach(el => el.remove());
    
    const notification = document.createElement('div');
    notification.className = `safe-notification fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
        type === 'error' ? 'bg-red-500 text-white' :
        type === 'success' ? 'bg-green-500 text-white' :
        type === 'warning' ? 'bg-yellow-500 text-black' :
        'bg-blue-500 text-white'
    }`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

/**
 * Safe initialization function
 */
function initializeSafely() {
    try {
        // Ensure global object exists
        if (!window.SongForge) {
            window.SongForge = {};
        }
        
        // Initialize with safe defaults
        initializeSafeDefaults();
        
        // Try main initialization
        if (typeof initializeEnhancedApp === 'function') {
            initializeEnhancedApp();
        } else {
            initializeBasicApp();
        }
        
        console.log('SongForge initialized safely');
        
    } catch (error) {
        console.error('Safe initialization failed:', error);
        initializeEmergencyMode();
    }
}

/**
 * Initialize safe defaults
 */
function initializeSafeDefaults() {
    // Safe app state
    window.SongForge.app = window.SongForge.app || {
        currentScreen: 'welcome',
        currentTab: 'workflow',
        currentProject: null,
        projectHistory: [],
        historyIndex: -1,
        maxHistorySize: 20,
        initialized: false,
        autoSaveInterval: null
    };
    
    // Safe auth state
    window.SongForge.auth = window.SongForge.auth || {
        currentUser: {
            id: 'guest',
            username: 'Guest User',
            email: 'guest@songforge.local',
            isGuest: true,
            projects: []
        },
        isLoggedIn: true,
        users: [],
        skipSignIn: true
    };
    
    // Safe lyrics state
    window.SongForge.lyricsEnhanced = window.SongForge.lyricsEnhanced || {
        sections: [],
        currentSection: null,
        rhymeSettings: {
            density: 5,
            layeredMetaphors: 3,
            puns: 2,
            internalRhymes: 4,
            doubleEntendres: 2,
            assonance: 3,
            consonance: 3,
            radioFriendly: true
        },
        combinedText: '',
        importedProjects: []
    };
    
    // Create safe default project
    if (!window.SongForge.app.currentProject) {
        window.SongForge.app.currentProject = createSafeProject();
    }
}

/**
 * Create safe default project
 */
function createSafeProject() {
    return {
        id: Date.now().toString(36),
        title: '',
        artist: '',
        genre: '',
        bpm: '',
        key: '',
        notes: '',
        lyrics: [
            { id: 'v1', type: 'verse', title: 'Verse 1', content: '', wordCount: 0, lineCount: 0, order: 0 },
            { id: 'c1', type: 'chorus', title: 'Chorus', content: '', wordCount: 0, lineCount: 0, order: 1 }
        ],
        workflow: [
            { id: 1, title: 'Concept & Theme Development', completed: false, notes: '', order: 0 },
            { id: 2, title: 'Lyrics Writing', completed: false, notes: '', order: 1 },
            { id: 3, title: 'Beat Selection', completed: false, notes: '', order: 2 },
            { id: 4, title: 'Recording', completed: false, notes: '', order: 3 }
        ],
        release: [
            { id: 1, title: 'Final master approved', completed: false, order: 0 },
            { id: 2, title: 'Artwork completed', completed: false, order: 1 },
            { id: 3, title: 'Metadata completed', completed: false, order: 2 }
        ],
        recordings: [],
        beat: null,
        artwork: null,
        releaseDate: '',
        createdDate: new Date().toLocaleDateString(),
        modifiedDate: new Date().toLocaleDateString(),
        version: '2.0'
    };
}

/**
 * Initialize basic app functionality
 */
function initializeBasicApp() {
    console.log('Initializing basic app...');
    
    // Setup basic navigation
    setupBasicNavigation();
    
    // Show appropriate screen
    if (window.SongForge.auth.isLoggedIn) {
        showSafeScreen('dashboard');
    } else {
        showSafeScreen('welcome');
    }
    
    // Initialize icons if available
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

/**
 * Setup basic navigation
 */
function setupBasicNavigation() {
    // Start/New Project buttons
    const startBtns = ['startBtn', 'newProjectBtn', 'mobileNewProjectBtn'];
    startBtns.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', () => {
                createAndShowProject();
            });
        }
    });
    
    // Dashboard button
    const dashboardBtns = ['dashboardBtn', 'mobileDashboardBtn'];
    dashboardBtns.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener('click', () => {
                showSafeScreen('dashboard');
            });
        }
    });
    
    // Tab navigation
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const tabName = btn.dataset.tab;
            switchSafeTab(tabName);
        });
    });
}

/**
 * Create and show project safely
 */
function createAndShowProject() {
    try {
        window.SongForge.app.currentProject = createSafeProject();
        showSafeScreen('project');
        updateProjectUI();
        showSafeNotification('New project created', 'success');
    } catch (error) {
        console.error('Error creating project:', error);
        showSafeNotification('Error creating project', 'error');
    }
}

/**
 * Show screen safely
 */
function showSafeScreen(screenName) {
    // Hide all screens
    const screens = ['welcomeScreen', 'dashboardScreen', 'projectInterface', 'freestyleMode'];
    screens.forEach(id => {
        const screen = document.getElementById(id);
        if (screen) screen.classList.add('hidden');
    });
    
    // Show requested screen
    let targetScreen;
    switch (screenName) {
        case 'dashboard':
            targetScreen = document.getElementById('dashboardScreen');
            window.SongForge.app.currentScreen = 'dashboard';
            break;
        case 'project':
            targetScreen = document.getElementById('projectInterface');
            window.SongForge.app.currentScreen = 'project';
            break;
        case 'freestyle':
            targetScreen = document.getElementById('freestyleMode');
            window.SongForge.app.currentScreen = 'freestyle';
            break;
        default:
            targetScreen = document.getElementById('welcomeScreen');
            window.SongForge.app.currentScreen = 'welcome';
    }
    
    if (targetScreen) {
        targetScreen.classList.remove('hidden');
    }
}

/**
 * Switch tab safely
 */
function switchSafeTab(tabName) {
    try {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active', 'text-primary', 'border-b-2', 'border-primary');
            btn.classList.add('text-gray-600', 'dark:text-gray-400');
        });
        
        const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active', 'text-primary', 'border-b-2', 'border-primary');
            activeBtn.classList.remove('text-gray-600', 'dark:text-gray-400');
        }
        
        window.SongForge.app.currentTab = tabName;
        
        // Load basic tab content
        loadSafeTabContent(tabName);
        
    } catch (error) {
        console.error('Error switching tab:', error);
        showSafeNotification('Error loading tab', 'error');
    }
}

/**
 * Load safe tab content
 */
function loadSafeTabContent(tabName) {
    const tabContent = document.getElementById('tabContent');
    if (!tabContent) return;
    
    switch (tabName) {
        case 'workflow':
            tabContent.innerHTML = `
                <div class="bg-light-panel dark:bg-dark-panel rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                    <h3 class="text-lg font-semibold mb-4">Workflow</h3>
                    <div id="safeWorkflowSteps" class="space-y-3">
                        ${renderSafeWorkflow()}
                    </div>
                </div>
            `;
            break;
            
        case 'lyrics':
            tabContent.innerHTML = `
                <div class="bg-light-panel dark:bg-dark-panel rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                    <h3 class="text-lg font-semibold mb-4">Lyrics</h3>
                    <div id="safeLyricsContainer">
                        ${renderSafeLyrics()}
                    </div>
                </div>
            `;
            break;
            
        case 'beats':
            tabContent.innerHTML = `
                <div class="bg-light-panel dark:bg-dark-panel rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                    <h3 class="text-lg font-semibold mb-4">Beats</h3>
                    <p class="text-gray-500">Beat management coming soon...</p>
                </div>
            `;
            break;
            
        case 'artwork':
            tabContent.innerHTML = `
                <div class="bg-light-panel dark:bg-dark-panel rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                    <h3 class="text-lg font-semibold mb-4">Artwork</h3>
                    <p class="text-gray-500">Artwork tools coming soon...</p>
                </div>
            `;
            break;
            
        case 'release':
            tabContent.innerHTML = `
                <div class="bg-light-panel dark:bg-dark-panel rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                    <h3 class="text-lg font-semibold mb-4">Release</h3>
                    <div id="safeReleaseSteps" class="space-y-3">
                        ${renderSafeRelease()}
                    </div>
                </div>
            `;
            break;
            
        default:
            tabContent.innerHTML = `
                <div class="text-center py-8">
                    <p class="text-gray-500">Tab content loading...</p>
                </div>
            `;
    }
}

/**
 * Render safe workflow
 */
function renderSafeWorkflow() {
    if (!window.SongForge.app.currentProject || !window.SongForge.app.currentProject.workflow) {
        return '<p class="text-gray-500">No workflow steps available</p>';
    }
    
    return window.SongForge.app.currentProject.workflow.map(step => `
        <div class="flex items-center p-3 bg-light-bg dark:bg-dark-bg rounded-lg">
            <input type="checkbox" ${step.completed ? 'checked' : ''} 
                   class="mr-3 text-primary focus:ring-primary">
            <span class="flex-1 ${step.completed ? 'line-through text-gray-500' : ''}">${step.title}</span>
        </div>
    `).join('');
}

/**
 * Render safe lyrics
 */
function renderSafeLyrics() {
    if (!window.SongForge.app.currentProject || !window.SongForge.app.currentProject.lyrics) {
        return '<p class="text-gray-500">No lyrics available</p>';
    }
    
    return window.SongForge.app.currentProject.lyrics.map(section => `
        <div class="mb-4 p-4 bg-light-bg dark:bg-dark-bg rounded-lg">
            <h4 class="font-medium mb-2">${section.title}</h4>
            <textarea class="w-full h-24 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-light-panel dark:bg-dark-panel resize-none text-base" 
                     placeholder="Enter lyrics...">${section.content || ''}</textarea>
        </div>
    `).join('');
}

/**
 * Render safe release
 */
function renderSafeRelease() {
    if (!window.SongForge.app.currentProject || !window.SongForge.app.currentProject.release) {
        return '<p class="text-gray-500">No release steps available</p>';
    }
    
    return window.SongForge.app.currentProject.release.map(step => `
        <div class="flex items-center p-3 bg-light-bg dark:bg-dark-bg rounded-lg">
            <input type="checkbox" ${step.completed ? 'checked' : ''} 
                   class="mr-3 text-primary focus:ring-primary">
            <span class="flex-1 ${step.completed ? 'line-through text-gray-500' : ''}">${step.title}</span>
        </div>
    `).join('');
}

/**
 * Update project UI safely
 */
function updateProjectUI() {
    if (!window.SongForge.app.currentProject) return;
    
    const project = window.SongForge.app.currentProject;
    
    // Update inputs safely
    const updates = [
        { id: 'projectTitle', value: project.title },
        { id: 'artistName', value: project.artist },
        { id: 'genre', value: project.genre },
        { id: 'bpm', value: project.bpm },
        { id: 'key', value: project.key }
    ];
    
    updates.forEach(({ id, value }) => {
        const element = document.getElementById(id);
        if (element) {
            element.value = value || '';
        }
    });
}

/**
 * Emergency mode initialization
 */
function initializeEmergencyMode() {
    console.log('Initializing emergency mode...');
    
    // Show minimal interface
    document.body.innerHTML = `
        <div class="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
            <div class="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full text-center">
                <h1 class="text-2xl font-bold text-blue-600 mb-4">🎵 SongForge</h1>
                <p class="text-gray-600 dark:text-gray-400 mb-6">
                    The app encountered an issue during startup. 
                    Please refresh the page to try again.
                </p>
                <button onclick="window.location.reload()" 
                        class="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg font-medium">
                    Refresh Page
                </button>
                <div class="mt-4 text-sm text-gray-500">
                    <p>If this problem persists, try:</p>
                    <ul class="mt-2 text-left">
                        <li>• Clearing browser cache</li>
                        <li>• Disabling browser extensions</li>
                        <li>• Using a different browser</li>
                    </ul>
                </div>
            </div>
        </div>
    `;
}

// Make safe functions globally available
window.showSafeNotification = showSafeNotification;
window.initializeSafely = initializeSafely;
window.createAndShowProject = createAndShowProject;

console.log('Startup safety loaded');
