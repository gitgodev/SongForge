// =========================================
// APPLICATION
// =========================================

// Enhanced app state
window.SongForge = window.SongForge || {};
window.SongForge.app = {
    currentScreen: 'welcome',
    currentTab: 'workflow',
    currentProject: null,
    projectHistory: [],
    historyIndex: -1,
    maxHistorySize: 20,
    initialized: false,
    autoSaveInterval: null
};

// Default project structure
const DEFAULT_PROJECT = {
    id: null,
    title: '',
    artist: '',
    genre: '',
    bpm: '',
    key: '',
    notes: '',
    lyrics: [],
    workflow: [],
    release: [],
    beat: null,
    artwork: null,
    releaseDate: '',
    createdDate: new Date().toLocaleDateString(),
    modifiedDate: new Date().toLocaleDateString(),
    version: '2.0'
};

// Default workflow steps
const DEFAULT_WORKFLOW = [
    { id: 1, title: 'Concept & Theme Development', completed: false, notes: '', order: 0 },
    { id: 2, title: 'Beat Selection & Licensing', completed: false, notes: '', order: 1 },
    { id: 3, title: 'Lyrics Writing & Structure', completed: false, notes: '', order: 2 },
    { id: 4, title: 'Vocal Recording & Performance', completed: false, notes: '', order: 3 },
    { id: 5, title: 'Mixing & Audio Engineering', completed: false, notes: '', order: 4 },
    { id: 6, title: 'Mastering & Final Audio', completed: false, notes: '', order: 5 },
    { id: 7, title: 'Album Artwork & Visual Design', completed: false, notes: '', order: 6 },
    { id: 8, title: 'Release Strategy & Distribution', completed: false, notes: '', order: 7 }
];

// Default release checklist
const DEFAULT_RELEASE = [
    { id: 1, title: 'Final master approved and quality checked', completed: false, order: 0 },
    { id: 2, title: 'Album artwork finalized (3000x3000px)', completed: false, order: 1 },
    { id: 3, title: 'Metadata and credits completed', completed: false, order: 2 },
    { id: 4, title: 'Distribution platform selected', completed: false, order: 3 },
    { id: 5, title: 'Release date set and scheduled', completed: false, order: 4 },
    { id: 6, title: 'Pre-save/pre-order campaign launched', completed: false, order: 5 },
    { id: 7, title: 'Social media content created', completed: false, order: 6 },
    { id: 8, title: 'Press release and media kit prepared', completed: false, order: 7 },
    { id: 9, title: 'Playlist pitching completed', completed: false, order: 8 },
    { id: 10, title: 'Launch day promotion scheduled', completed: false, order: 9 }
];

// =========================================
// APPLICATION INITIALIZATION
// =========================================

/**
 * Initialize enhanced application
 */
function initializeEnhancedApp() {
    if (window.SongForge.app.initialized) return;
    
    try {
        console.log('Initializing Enhanced SongForge...');
        
        // Initialize subsystems
        initializeAuth();
        setupEnhancedEventListeners();
        setupAutoSave();
        setupKeyboardShortcuts();
        
        // Initialize UI state
        updateThemeIcon();
        
        // Load or create default project
        loadOrCreateProject();
        
        window.SongForge.app.initialized = true;
        console.log('Enhanced SongForge initialized successfully');
        
    } catch (error) {
        console.error('Enhanced app initialization error:', error);
        handleError(error, 'Application initialization');
    }
}

/**
 * Setup enhanced event listeners
 */
function setupEnhancedEventListeners() {
    // Navigation
    setupNavigationListeners();
    setupProjectListeners();
    setupTabListeners();
    setupMobileMenuListeners();
    setupAuthEventListeners();
    
    // Import/Export
    setupImportExportListeners();
    
    // Window events
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('online', () => showNotification('Back online', 'success', 2000));
    window.addEventListener('offline', () => showNotification('You are offline', 'info', 3000));
}

/**
 * Setup navigation listeners
 */
function setupNavigationListeners() {
    // Dashboard navigation
    const dashboardBtns = ['dashboardBtn', 'mobileDashboardBtn'];
    dashboardBtns.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.addEventListener('click', showDashboard);
    });
    
    // New project buttons
    const newProjectBtns = ['newProjectBtn', 'mobileNewProjectBtn', 'startBtn'];
    newProjectBtns.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) btn.addEventListener('click', createNewProject);
    });
    
    // Quick action buttons
    const quickNewBtns = document.querySelectorAll('.quickNewProjectBtn');
    quickNewBtns.forEach(btn => {
        btn.addEventListener('click', createNewProject);
    });
    
    // Freestyle mode
    const freestyleModeBtn = document.getElementById('freestyleModeBtn');
    if (freestyleModeBtn) {
        freestyleModeBtn.addEventListener('click', showFreestyleMode);
    }
    
    const backToDashboard = document.getElementById('backToDashboard');
    if (backToDashboard) {
        backToDashboard.addEventListener('click', showDashboard);
    }
}

/**
 * Setup project listeners
 */
function setupProjectListeners() {
    // Project metadata inputs
    const inputs = [
        { id: 'projectTitle', property: 'title' },
        { id: 'artistName', property: 'artist' },
        { id: 'genre', property: 'genre' },
        { id: 'bpm', property: 'bpm' },
        { id: 'key', property: 'key' },
        { id: 'releaseDate', property: 'releaseDate' }
    ];
    
    inputs.forEach(({ id, property }) => {
        const element = document.getElementById(id);
        if (element) {
            const handler = debounce((e) => {
                updateProjectProperty(property, e.target.value);
            }, 300);
            element.addEventListener('input', handler);
        }
    });
    
    // Action buttons
    const saveBtn = document.getElementById('saveBtn');
    const exportBtn = document.getElementById('exportBtn');
    const undoBtn = document.getElementById('undoBtn');
    
    if (saveBtn) saveBtn.addEventListener('click', saveCurrentProject);
    if (exportBtn) exportBtn.addEventListener('click', showExportOptions);
    if (undoBtn) undoBtn.addEventListener('click', undoLastChange);
}

/**
 * Setup tab listeners
 */
function setupTabListeners() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const tabName = btn.dataset.tab;
            switchToTab(tabName);
        });
    });
}

/**
 * Setup mobile menu listeners
 */
function setupMobileMenuListeners() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const mobileThemeToggle = document.getElementById('mobileThemeToggle');
    const themeToggle = document.getElementById('themeToggle');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }
    
    if (mobileThemeToggle) {
        mobileThemeToggle.addEventListener('click', toggleDarkMode);
    }
    
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleDarkMode);
    }
}

/**
 * Setup import/export listeners
 */
function setupImportExportListeners() {
    const importProjectBtn = document.getElementById('importProjectBtn');
    const importInput = document.getElementById('importInput');
    
    if (importProjectBtn && importInput) {
        importProjectBtn.addEventListener('click', () => {
            importInput.click();
        });
        
        importInput.addEventListener('change', handleProjectImport);
    }
}

// =========================================
// SCREEN MANAGEMENT
// =========================================

/**
 * Show welcome screen
 */
function showWelcomeScreen() {
    hideAllScreens();
    const welcomeScreen = document.getElementById('welcomeScreen');
    if (welcomeScreen) {
        welcomeScreen.classList.remove('hidden');
        window.SongForge.app.currentScreen = 'welcome';
    }
}

/**
 * Show dashboard
 */
function showDashboard() {
    hideAllScreens();
    const dashboardScreen = document.getElementById('dashboardScreen');
    if (dashboardScreen) {
        dashboardScreen.classList.remove('hidden');
        window.SongForge.app.currentScreen = 'dashboard';
        loadRecentProjects();
    }
}

/**
 * Show project interface
 */
function showProjectInterface() {
    hideAllScreens();
    const projectInterface = document.getElementById('projectInterface');
    if (projectInterface) {
        projectInterface.classList.remove('hidden');
        window.SongForge.app.currentScreen = 'project';
        loadTabContent(window.SongForge.app.currentTab);
    }
}

/**
 * Show freestyle mode
 */
function showFreestyleMode() {
    hideAllScreens();
    const freestyleMode = document.getElementById('freestyleMode');
    if (freestyleMode) {
        freestyleMode.classList.remove('hidden');
        window.SongForge.app.currentScreen = 'freestyle';
        
        // Initialize freestyle if not already done
        if (typeof initializeFreestyle === 'function') {
            initializeFreestyle();
        }
    }
}

/**
 * Hide all screens
 */
function hideAllScreens() {
    const screens = ['welcomeScreen', 'dashboardScreen', 'projectInterface', 'freestyleMode'];
    screens.forEach(id => {
        const screen = document.getElementById(id);
        if (screen) screen.classList.add('hidden');
    });
}

// =========================================
// PROJECT MANAGEMENT
// =========================================

/**
 * Create new project
 */
function createNewProject() {
    const newProject = {
        ...deepClone(DEFAULT_PROJECT),
        id: generateId(),
        workflow: deepClone(DEFAULT_WORKFLOW),
        release: deepClone(DEFAULT_RELEASE),
        createdDate: new Date().toLocaleDateString()
    };
    
    setCurrentProject(newProject);
    showProjectInterface();
    showNotification('New project created', 'success');
}

/**
 * Load or create project
 */
function loadOrCreateProject() {
    // Try to load the last project
    const lastProject = loadFromStorage('current-project');
    
    if (lastProject && lastProject.id) {
        setCurrentProject(lastProject);
    } else {
        // No existing project, show dashboard or welcome
        if (window.SongForge.auth.isLoggedIn) {
            showDashboard();
        } else {
            showWelcomeScreen();
        }
    }
}

/**
 * Set current project
 */
function setCurrentProject(project) {
    // Save current state to history before changing
    if (window.SongForge.app.currentProject) {
        saveToHistory(window.SongForge.app.currentProject);
    }
    
    window.SongForge.app.currentProject = project;
    updateProjectUI();
    updateUndoButton();
}

/**
 * Update project property
 */
function updateProjectProperty(property, value) {
    if (!window.SongForge.app.currentProject) return;
    
    // Save to history before making changes
    saveToHistory(window.SongForge.app.currentProject);
    
    window.SongForge.app.currentProject[property] = value;
    window.SongForge.app.currentProject.modifiedDate = new Date().toLocaleDateString();
    
    updateUndoButton();
    markProjectModified();
}

/**
 * Update project UI
 */
function updateProjectUI() {
    if (!window.SongForge.app.currentProject) return;
    
    const project = window.SongForge.app.currentProject;
    
    // Update form fields
    const updates = [
        { id: 'projectTitle', value: project.title },
        { id: 'artistName', value: project.artist },
        { id: 'genre', value: project.genre },
        { id: 'bpm', value: project.bpm },
        { id: 'key', value: project.key },
        { id: 'releaseDate', value: project.releaseDate },
        { id: 'projectDate', value: project.createdDate }
    ];
    
    updates.forEach(({ id, value }) => {
        const element = document.getElementById(id);
        if (element) {
            if (id === 'projectDate') {
                element.textContent = value || '';
            } else {
                element.value = value || '';
            }
        }
    });
    
    // Update document title
    if (project.title) {
        document.title = `${project.title} - SongForge`;
    } else {
        document.title = 'SongForge - Ultimate Track Creation Assistant';
    }
}

/**
 * Save current project
 */
function saveCurrentProject() {
    if (!window.SongForge.app.currentProject) return;
    
    try {
        // Save to local storage
        saveToStorage('current-project', window.SongForge.app.currentProject);
        
        // Save to user's project list if logged in
        if (window.SongForge.auth.isLoggedIn) {
            saveProjectForUser(window.SongForge.app.currentProject);
        }
        
        markProjectSaved();
        showNotification('Project saved successfully', 'success');
        
    } catch (error) {
        handleError(error, 'Project save');
        showNotification('Failed to save project', 'error');
    }
}

/**
 * Mark project as modified
 */
function markProjectModified() {
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
        saveBtn.classList.remove('bg-green-500', 'hover:bg-green-600');
        saveBtn.classList.add('bg-yellow-500', 'hover:bg-yellow-600');
        saveBtn.innerHTML = '<i data-lucide="save" class="w-4 h-4 mr-2 inline"></i>Save*';
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
}

/**
 * Mark project as saved
 */
function markProjectSaved() {
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
        saveBtn.classList.remove('bg-yellow-500', 'hover:bg-yellow-600');
        saveBtn.classList.add('bg-green-500', 'hover:bg-green-600');
        saveBtn.innerHTML = '<i data-lucide="save" class="w-4 h-4 mr-2 inline"></i>Save';
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
}

// =========================================
// HISTORY MANAGEMENT (UNDO FUNCTIONALITY)
// =========================================

/**
 * Save state to history
 */
function saveToHistory(project) {
    if (!project) return;
    
    const history = window.SongForge.app.projectHistory;
    const clone = deepClone(project);
    
    // Remove future history if we're not at the end
    if (window.SongForge.app.historyIndex < history.length - 1) {
        history.splice(window.SongForge.app.historyIndex + 1);
    }
    
    // Add new state
    history.push(clone);
    
    // Limit history size
    if (history.length > window.SongForge.app.maxHistorySize) {
        history.shift();
    } else {
        window.SongForge.app.historyIndex++;
    }
    
    updateUndoButton();
}

/**
 * Undo last change
 */
function undoLastChange() {
    const history = window.SongForge.app.projectHistory;
    
    if (window.SongForge.app.historyIndex > 0) {
        window.SongForge.app.historyIndex--;
        const previousState = history[window.SongForge.app.historyIndex];
        
        // Restore without creating new history entry
        window.SongForge.app.currentProject = deepClone(previousState);
        updateProjectUI();
        updateUndoButton();
        
        showNotification('Change undone', 'info');
    }
}

/**
 * Update undo button state
 */
function updateUndoButton() {
    const undoBtn = document.getElementById('undoBtn');
    if (undoBtn) {
        const canUndo = window.SongForge.app.historyIndex > 0;
        undoBtn.disabled = !canUndo;
        
        if (canUndo) {
            undoBtn.classList.remove('opacity-50', 'cursor-not-allowed');
            undoBtn.classList.add('hover:bg-yellow-600');
        } else {
            undoBtn.classList.add('opacity-50', 'cursor-not-allowed');
            undoBtn.classList.remove('hover:bg-yellow-600');
        }
    }
}

// =========================================
// TAB MANAGEMENT
// =========================================

/**
 * Switch to tab
 */
function switchToTab(tabName) {
    if (window.SongForge.app.currentTab === tabName) return;
    
    // Update button states
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
    loadTabContent(tabName);
}

/**
 * Load tab content
 */
function loadTabContent(tabName) {
    const tabContent = document.getElementById('tabContent');
    if (!tabContent) return;
    
    // Show loading spinner
    tabContent.innerHTML = `
        <div class="flex items-center justify-center py-12">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span class="ml-3">Loading...</span>
        </div>
    `;
    
    // Load content based on tab
    setTimeout(() => {
        switch (tabName) {
            case 'workflow':
                loadWorkflowContent();
                break;
            case 'lyrics':
                loadLyricsContent();
                break;
            case 'beats':
                loadBeatsContent();
                break;
            case 'artwork':
                loadArtworkContent();
                break;
            case 'release':
                loadReleaseContent();
                break;
            default:
                tabContent.innerHTML = '<p class="text-center py-8">Tab content not found</p>';
        }
    }, 100);
}

/**
 * Load workflow content
 */
function loadWorkflowContent() {
    const tabContent = document.getElementById('tabContent');
    if (!tabContent) return;
    
    tabContent.innerHTML = `
        <div class="grid lg:grid-cols-2 gap-6">
            <div class="bg-light-panel dark:bg-dark-panel rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold">Track Creation Workflow</h3>
                    <div class="text-sm text-gray-500">
                        <span id="workflowProgress">0/8 completed</span>
                    </div>
                </div>
                <div id="workflowSteps" class="space-y-3">
                    <!-- Workflow steps will be rendered here -->
                </div>
                <button id="addWorkflowStep" class="mt-4 text-primary hover:text-primary-dark transition-colors">
                    <i data-lucide="plus" class="w-4 h-4 mr-2 inline"></i>
                    Add Custom Step
                </button>
            </div>
            <div class="bg-light-panel dark:bg-dark-panel rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                <h3 class="text-lg font-semibold mb-4">Project Notes</h3>
                <textarea id="projectNotes" placeholder="Add notes, ideas, inspiration, or any thoughts about this track..." 
                         class="w-full h-64 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-light-bg dark:bg-dark-bg resize-none custom-scrollbar text-base"></textarea>
            </div>
        </div>
    `;
    
    // Render workflow steps
    renderWorkflowSteps();
    
    // Setup notes listener
    const projectNotes = document.getElementById('projectNotes');
    if (projectNotes && window.SongForge.app.currentProject) {
        projectNotes.value = window.SongForge.app.currentProject.notes || '';
        projectNotes.addEventListener('input', debounce((e) => {
            updateProjectProperty('notes', e.target.value);
        }, 300));
    }
    
    // Setup add step button
    const addWorkflowStep = document.getElementById('addWorkflowStep');
    if (addWorkflowStep) {
        addWorkflowStep.addEventListener('click', addCustomWorkflowStep);
    }
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

/**
 * Load lyrics content
 */
function loadLyricsContent() {
    const tabContent = document.getElementById('tabContent');
    if (!tabContent) return;
    
    tabContent.innerHTML = `<div class="text-center py-8">Loading lyrics editor...</div>`;
    
    // Initialize enhanced lyrics if available
    if (typeof loadEnhancedLyricsContent === 'function') {
        loadEnhancedLyricsContent();
    } else {
        tabContent.innerHTML = `<div class="text-center py-8 text-gray-500">Lyrics editor not available</div>`;
    }
}

/**
 * Load beats content
 */
function loadBeatsContent() {
    const tabContent = document.getElementById('tabContent');
    if (!tabContent) return;
    
    tabContent.innerHTML = `<div class="text-center py-8">Loading beats section...</div>`;
    
    // Initialize beats if available
    if (typeof loadBeatsContent === 'function') {
        loadBeatsContent();
    } else {
        tabContent.innerHTML = `<div class="text-center py-8 text-gray-500">Beats section not available</div>`;
    }
}

/**
 * Load artwork content
 */
function loadArtworkContent() {
    const tabContent = document.getElementById('tabContent');
    if (!tabContent) return;
    
    tabContent.innerHTML = `<div class="text-center py-8">Loading artwork tools...</div>`;
    
    // Initialize AI artwork if available
    if (typeof loadArtworkAIContent === 'function') {
        loadArtworkAIContent();
    } else {
        tabContent.innerHTML = `<div class="text-center py-8 text-gray-500">Artwork tools not available</div>`;
    }
}

/**
 * Load release content
 */
function loadReleaseContent() {
    const tabContent = document.getElementById('tabContent');
    if (!tabContent) return;
    
    tabContent.innerHTML = `
        <div class="grid lg:grid-cols-2 gap-6">
            <div class="bg-light-panel dark:bg-dark-panel rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold">Release Checklist</h3>
                    <div class="text-sm text-gray-500">
                        <span id="releaseProgress">0/10 completed</span>
                    </div>
                </div>
                <div id="releaseSteps" class="space-y-3">
                    <!-- Release steps will be rendered here -->
                </div>
            </div>
            <div class="bg-light-panel dark:bg-dark-panel rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                <h3 class="text-lg font-semibold mb-4">Distribution Platforms</h3>
                <div class="space-y-3 mb-6">
                    <a href="https://distrokid.com" target="_blank" class="block p-3 bg-light-bg dark:bg-dark-bg rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-gray-200 dark:border-gray-700">
                        <div class="flex items-center justify-between">
                            <span class="font-medium">DistroKid</span>
                            <i data-lucide="external-link" class="w-4 h-4"></i>
                        </div>
                        <p class="text-sm text-gray-600 dark:text-gray-400">Fast distribution to all major platforms</p>
                    </a>
                    <a href="https://www.tunecore.com" target="_blank" class="block p-3 bg-light-bg dark:bg-dark-bg rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-gray-200 dark:border-gray-700">
                        <div class="flex items-center justify-between">
                            <span class="font-medium">TuneCore</span>
                            <i data-lucide="external-link" class="w-4 h-4"></i>
                        </div>
                        <p class="text-sm text-gray-600 dark:text-gray-400">Keep 100% of your royalties</p>
                    </a>
                    <a href="https://cdbaby.com" target="_blank" class="block p-3 bg-light-bg dark:bg-dark-bg rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border border-gray-200 dark:border-gray-700">
                        <div class="flex items-center justify-between">
                            <span class="font-medium">CD Baby</span>
                            <i data-lucide="external-link" class="w-4 h-4"></i>
                        </div>
                        <p class="text-sm text-gray-600 dark:text-gray-400">Comprehensive music services</p>
                    </a>
                </div>
                <div>
                    <label class="block text-sm font-medium mb-2">Target Release Date</label>
                    <input type="date" id="releaseDate" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-light-bg dark:bg-dark-bg text-base">
                </div>
            </div>
        </div>
    `;
    
    // Render release steps
    renderReleaseSteps();
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// =========================================
// PROJECT IMPORT/EXPORT
// =========================================

/**
 * Handle project import
 */
function handleProjectImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.type.includes('json')) {
        showNotification('Please select a valid JSON project file', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const projectData = JSON.parse(e.target.result);
            
            // Validate project structure
            if (!projectData.id || !projectData.version) {
                throw new Error('Invalid project file format');
            }
            
            // Set as current project
            setCurrentProject(projectData);
            showProjectInterface();
            showNotification('Project imported successfully', 'success');
            
        } catch (error) {
            console.error('Import error:', error);
            showNotification('Failed to import project: Invalid file format', 'error');
        }
    };
    
    reader.readAsText(file);
    
    // Reset input
    event.target.value = '';
}

/**
 * Show export options
 */
function showExportOptions() {
    if (!window.SongForge.app.currentProject) {
        showNotification('No project to export', 'error');
        return;
    }
    
    const content = `
        <div class="space-y-4">
            <h3 class="text-lg font-semibold">Export Project</h3>
            
            <div class="space-y-3">
                <label class="flex items-center">
                    <input type="checkbox" id="exportComplete" checked class="mr-2 text-primary">
                    <span>Complete project file (.json)</span>
                </label>
                <label class="flex items-center">
                    <input type="checkbox" id="exportLyrics" checked class="mr-2 text-primary">
                    <span>Lyrics (.txt)</span>
                </label>
                <label class="flex items-center">
                    <input type="checkbox" id="exportWorkflow" class="mr-2 text-primary">
                    <span>Workflow checklist (.txt)</span>
                </label>
            </div>
            
            <div class="flex space-x-3">
                <button onclick="executeProjectExport()" 
                        class="flex-1 bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-lg transition-colors">
                    Export
                </button>
                <button onclick="closeModal()" 
                        class="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors">
                    Cancel
                </button>
            </div>
        </div>
    `;
    
    showModal('Export Options', content);
}

/**
 * Execute project export
 */
function executeProjectExport() {
    const project = window.SongForge.app.currentProject;
    const filename = project.title || 'songforge-project';
    
    const exportComplete = document.getElementById('exportComplete')?.checked;
    const exportLyrics = document.getElementById('exportLyrics')?.checked;
    const exportWorkflow = document.getElementById('exportWorkflow')?.checked;
    
    if (exportComplete) {
        const projectData = {
            ...project,
            exportDate: new Date().toISOString()
        };
        downloadFile(JSON.stringify(projectData, null, 2), `${filename}.json`, 'application/json');
    }
    
    if (exportLyrics && project.lyrics && project.lyrics.length > 0) {
        let lyricsContent = `${project.title || 'Untitled'}\n`;
        if (project.artist) lyricsContent += `Artist: ${project.artist}\n\n`;
        
        project.lyrics.forEach(section => {
            if (section.content) {
                lyricsContent += `[${section.title}]\n${section.content}\n\n`;
            }
        });
        
        downloadFile(lyricsContent, `${filename}-lyrics.txt`, 'text/plain');
    }
    
    if (exportWorkflow && project.workflow && project.workflow.length > 0) {
        let workflowContent = `${project.title || 'Untitled'} - Workflow\n\n`;
        
        project.workflow.forEach((step, index) => {
            const status = step.completed ? '✓' : '☐';
            workflowContent += `${status} ${step.title}\n`;
            if (step.notes) {
                workflowContent += `   Notes: ${step.notes}\n`;
            }
            workflowContent += '\n';
        });
        
        downloadFile(workflowContent, `${filename}-workflow.txt`, 'text/plain');
    }
    
    closeModal();
    showNotification('Export completed', 'success');
}

// =========================================
// RECENT PROJECTS
// =========================================

/**
 * Load recent projects
 */
function loadRecentProjects() {
    const container = document.getElementById('recentProjectsList');
    if (!container) return;
    
    const projects = getProjectsForUser();
    
    if (projects.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-gray-500">
                <i data-lucide="folder-open" class="w-12 h-12 mx-auto mb-3 opacity-50"></i>
                <p>No projects yet</p>
                <p class="text-sm">Create your first project to get started</p>
            </div>
        `;
        if (typeof lucide !== 'undefined') lucide.createIcons();
        return;
    }
    
    // Sort by modified date
    const sortedProjects = projects
        .sort((a, b) => new Date(b.modifiedDate) - new Date(a.modifiedDate))
        .slice(0, 5); // Show only 5 most recent
    
    container.innerHTML = sortedProjects.map(project => `
        <div class="flex items-center justify-between p-4 bg-light-bg dark:bg-dark-bg rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary transition-colors cursor-pointer" onclick="loadProject('${project.id}')">
            <div class="flex-1">
                <h4 class="font-medium">${project.title || 'Untitled Project'}</h4>
                <p class="text-sm text-gray-500">
                    ${project.artist ? `${project.artist} • ` : ''}
                    Modified ${project.modifiedDate}
                </p>
            </div>
            <div class="flex items-center space-x-2">
                <span class="text-xs px-2 py-1 bg-primary bg-opacity-20 text-primary rounded">${project.genre || 'Unknown'}</span>
                <i data-lucide="chevron-right" class="w-4 h-4 text-gray-400"></i>
            </div>
        </div>
    `).join('');
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

/**
 * Load specific project
 */
function loadProject(projectId) {
    const projects = getProjectsForUser();
    const project = projects.find(p => p.id === projectId);
    
    if (project) {
        setCurrentProject(project);
        showProjectInterface();
        showNotification('Project loaded', 'success');
    } else {
        showNotification('Project not found', 'error');
    }
}

// =========================================
// WORKFLOW FUNCTIONS
// =========================================

/**
 * Render workflow steps
 */
function renderWorkflowSteps() {
    const container = document.getElementById('workflowSteps');
    const progressContainer = document.getElementById('workflowProgress');
    
    if (!container || !window.SongForge.app.currentProject) return;
    
    const workflow = window.SongForge.app.currentProject.workflow || [];
    const completed = workflow.filter(step => step.completed).length;
    
    if (progressContainer) {
        progressContainer.textContent = `${completed}/${workflow.length} completed`;
    }
    
    container.innerHTML = workflow.map(step => `
        <div class="flex items-center p-3 bg-light-bg dark:bg-dark-bg rounded-lg border border-gray-200 dark:border-gray-700 ${step.completed ? 'opacity-75' : ''}">
            <label class="flex items-center cursor-pointer flex-1">
                <input type="checkbox" ${step.completed ? 'checked' : ''} 
                       onchange="toggleWorkflowStep(${step.id})"
                       class="mr-3 text-primary focus:ring-primary w-4 h-4">
                <span class="flex-1 ${step.completed ? 'line-through text-gray-500' : ''}">${step.title}</span>
            </label>
            <button onclick="editWorkflowStep(${step.id})" 
                    class="ml-3 text-gray-400 hover:text-primary transition-colors">
                <i data-lucide="edit" class="w-4 h-4"></i>
            </button>
        </div>
    `).join('');
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

/**
 * Toggle workflow step
 */
function toggleWorkflowStep(stepId) {
    if (!window.SongForge.app.currentProject) return;
    
    const step = window.SongForge.app.currentProject.workflow.find(s => s.id === stepId);
    if (step) {
        saveToHistory(window.SongForge.app.currentProject);
        step.completed = !step.completed;
        renderWorkflowSteps();
        markProjectModified();
        
        const action = step.completed ? 'completed' : 'marked incomplete';
        showNotification(`"${step.title}" ${action}`, 'success', 2000);
    }
}

/**
 * Edit workflow step
 */
function editWorkflowStep(stepId) {
    const step = window.SongForge.app.currentProject.workflow.find(s => s.id === stepId);
    if (!step) return;
    
    const content = `
        <div class="space-y-4">
            <h3 class="text-lg font-semibold">Edit Workflow Step</h3>
            
            <div>
                <label class="block text-sm font-medium mb-1">Step Title</label>
                <input type="text" id="stepTitle" value="${step.title}" 
                       class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-base">
            </div>
            
            <div>
                <label class="block text-sm font-medium mb-1">Notes</label>
                <textarea id="stepNotes" placeholder="Add notes about this step..." 
                         class="w-full h-24 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 resize-none text-base">${step.notes || ''}</textarea>
            </div>
            
            <div class="flex items-center">
                <input type="checkbox" id="stepCompleted" ${step.completed ? 'checked' : ''} 
                       class="mr-2 text-primary focus:ring-primary">
                <label for="stepCompleted" class="text-sm">Mark as completed</label>
            </div>
            
            <div class="flex space-x-3">
                <button onclick="updateWorkflowStep(${stepId})" 
                        class="flex-1 bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-lg transition-colors">
                    Save Changes
                </button>
                <button onclick="deleteWorkflowStep(${stepId})" 
                        class="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-colors">
                    Delete
                </button>
                <button onclick="closeModal()" 
                        class="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors">
                    Cancel
                </button>
            </div>
        </div>
    `;
    
    showModal('Edit Step', content);
}

/**
 * Update workflow step
 */
function updateWorkflowStep(stepId) {
    const step = window.SongForge.app.currentProject.workflow.find(s => s.id === stepId);
    const titleInput = document.getElementById('stepTitle');
    const notesTextarea = document.getElementById('stepNotes');
    const completedCheckbox = document.getElementById('stepCompleted');
    
    if (step && titleInput && notesTextarea && completedCheckbox) {
        const newTitle = titleInput.value.trim();
        
        if (!newTitle) {
            showNotification('Step title cannot be empty', 'error');
            return;
        }
        
        saveToHistory(window.SongForge.app.currentProject);
        
        step.title = newTitle;
        step.notes = notesTextarea.value.trim();
        step.completed = completedCheckbox.checked;
        
        renderWorkflowSteps();
        markProjectModified();
        closeModal();
        
        showNotification('Step updated successfully', 'success');
    }
}

/**
 * Delete workflow step
 */
function deleteWorkflowStep(stepId) {
    showConfirmDialog('Are you sure you want to delete this workflow step?', () => {
        saveToHistory(window.SongForge.app.currentProject);
        
        window.SongForge.app.currentProject.workflow = window.SongForge.app.currentProject.workflow
            .filter(s => s.id !== stepId);
        
        renderWorkflowSteps();
        markProjectModified();
        closeModal();
        
        showNotification('Workflow step deleted', 'info');
    });
}

/**
 * Add custom workflow step
 */
function addCustomWorkflowStep() {
    showInputDialog(
        'Add Custom Step',
        'Enter step title...',
        (title) => {
            if (!window.SongForge.app.currentProject.workflow) {
                window.SongForge.app.currentProject.workflow = [];
            }
            
            saveToHistory(window.SongForge.app.currentProject);
            
            const newStep = {
                id: Math.max(...window.SongForge.app.currentProject.workflow.map(s => s.id), 0) + 1,
                title: title,
                completed: false,
                notes: '',
                order: window.SongForge.app.currentProject.workflow.length
            };
            
            window.SongForge.app.currentProject.workflow.push(newStep);
            renderWorkflowSteps();
            markProjectModified();
            
            showNotification('Custom step added', 'success');
        }
    );
}

// =========================================
// RELEASE FUNCTIONS
// =========================================

/**
 * Render release steps
 */
function renderReleaseSteps() {
    const container = document.getElementById('releaseSteps');
    const progressContainer = document.getElementById('releaseProgress');
    
    if (!container || !window.SongForge.app.currentProject) return;
    
    const release = window.SongForge.app.currentProject.release || [];
    const completed = release.filter(step => step.completed).length;
    
    if (progressContainer) {
        progressContainer.textContent = `${completed}/${release.length} completed`;
    }
    
    container.innerHTML = release.map(step => `
        <div class="flex items-center p-3 bg-light-bg dark:bg-dark-bg rounded-lg border border-gray-200 dark:border-gray-700 ${step.completed ? 'opacity-75' : ''}">
            <label class="flex items-center cursor-pointer flex-1">
                <input type="checkbox" ${step.completed ? 'checked' : ''} 
                       onchange="toggleReleaseStep(${step.id})"
                       class="mr-3 text-primary focus:ring-primary w-4 h-4">
                <span class="flex-1 ${step.completed ? 'line-through text-gray-500' : ''}">${step.title}</span>
            </label>
        </div>
    `).join('');
}

/**
 * Toggle release step
 */
function toggleReleaseStep(stepId) {
    if (!window.SongForge.app.currentProject) return;
    
    const step = window.SongForge.app.currentProject.release.find(s => s.id === stepId);
    if (step) {
        saveToHistory(window.SongForge.app.currentProject);
        step.completed = !step.completed;
        renderReleaseSteps();
        markProjectModified();
        
        const action = step.completed ? 'completed' : 'marked incomplete';
        showNotification(`Release step ${action}`, 'success', 2000);
    }
}

// =========================================
// AUTO-SAVE
// =========================================

/**
 * Setup auto-save
 */
function setupAutoSave() {
    // Auto-save every 2 minutes
    window.SongForge.app.autoSaveInterval = setInterval(() => {
        if (window.SongForge.app.currentProject) {
            try {
                saveToStorage('autosave-project', window.SongForge.app.currentProject);
                console.log('Auto-save completed');
            } catch (error) {
                console.warn('Auto-save failed:', error);
            }
        }
    }, 120000);
}

/**
 * Setup keyboard shortcuts
 */
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Only apply shortcuts when not in input fields
        if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
        
        // Ctrl/Cmd + S - Save project
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            saveCurrentProject();
        }
        
        // Ctrl/Cmd + N - New project
        if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
            e.preventDefault();
            createNewProject();
        }
        
        // Ctrl/Cmd + Z - Undo
        if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
            e.preventDefault();
            undoLastChange();
        }
        
        // Escape - Close modal
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

/**
 * Handle before unload
 */
function handleBeforeUnload(e) {
    // Save current project state
    if (window.SongForge.app.currentProject) {
        saveToStorage('autosave-project', window.SongForge.app.currentProject);
    }
}

// =========================================
// GLOBAL FUNCTIONS
// =========================================

// Make functions globally available for HTML onclick attributes
window.toggleWorkflowStep = toggleWorkflowStep;
window.editWorkflowStep = editWorkflowStep;
window.updateWorkflowStep = updateWorkflowStep;
window.deleteWorkflowStep = deleteWorkflowStep;
window.toggleReleaseStep = toggleReleaseStep;
window.executeProjectExport = executeProjectExport;
window.loadProject = loadProject;

console.log('Enhanced SongForge app initialized');
