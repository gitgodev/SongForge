// =========================================
// MAIN APPLICATION FOR SONGFORGE
// =========================================

// Main application state
window.SongForge.app = {
    currentTab: 'workflow',
    initialized: false,
    autoSaveInterval: null,
    projectModified: false,
    lastSaveTime: null
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
    recordings: [],
    beatFile: null,
    artwork: null,
    releaseDate: '',
    createdDate: new Date().toLocaleDateString(),
    modifiedDate: new Date().toLocaleDateString(),
    version: '1.0'
};

// Default workflow steps
const DEFAULT_WORKFLOW_STEPS = [
    { id: 1, title: 'Concept & Idea Development', completed: false, notes: '', order: 0 },
    { id: 2, title: 'Beat Selection & Production', completed: false, notes: '', order: 1 },
    { id: 3, title: 'Lyrics Writing', completed: false, notes: '', order: 2 },
    { id: 4, title: 'Vocal Recording', completed: false, notes: '', order: 3 },
    { id: 5, title: 'Mixing & Mastering', completed: false, notes: '', order: 4 },
    { id: 6, title: 'Album Artwork Creation', completed: false, notes: '', order: 5 },
    { id: 7, title: 'Release Preparation', completed: false, notes: '', order: 6 },
    { id: 8, title: 'Distribution & Promotion', completed: false, notes: '', order: 7 }
];

// Default release steps
const DEFAULT_RELEASE_STEPS = [
    { id: 1, title: 'Final master approved and finalized', completed: false, order: 0 },
    { id: 2, title: 'Album artwork completed and approved', completed: false, order: 1 },
    { id: 3, title: 'Metadata and song information completed', completed: false, order: 2 },
    { id: 4, title: 'Distribution platform selected and set up', completed: false, order: 3 },
    { id: 5, title: 'Pre-save campaign created and launched', completed: false, order: 4 },
    { id: 6, title: 'Social media teasers and content created', completed: false, order: 5 },
    { id: 7, title: 'Playlist pitching and submissions completed', completed: false, order: 6 },
    { id: 8, title: 'Track uploaded to distributor and scheduled', completed: false, order: 7 },
    { id: 9, title: 'Press release and media outreach prepared', completed: false, order: 8 },
    { id: 10, title: 'Launch day promotional plan executed', completed: false, order: 9 }
];

// =========================================
// APPLICATION INITIALIZATION
// =========================================

/**
 * Initialize the main application
 */
function initializeApp() {
    if (window.SongForge.app.initialized) return;
    
    try {
        // Initialize current project
        window.SongForge.currentProject = deepClone(DEFAULT_PROJECT);
        window.SongForge.currentProject.id = generateId();
        
        // Setup event listeners
        setupMainEventListeners();
        
        // Initialize auto-save
        setupAutoSave();
        
        // Load any existing project from storage
        loadLastProject();
        
        // Mark as initialized
        window.SongForge.app.initialized = true;
        
        console.log('SongForge application initialized successfully');
        
    } catch (error) {
        handleError(error, 'Application initialization');
    }
}

/**
 * Setup main application event listeners
 */
function setupMainEventListeners() {
    // Welcome screen
    const startBtn = document.getElementById('startBtn');
    if (startBtn) {
        startBtn.addEventListener('click', startNewProject);
    }
    
    // Navigation
    const newProjectBtn = document.getElementById('newProjectBtn');
    if (newProjectBtn) {
        newProjectBtn.addEventListener('click', handleNewProject);
    }
    
    // Save and export
    const saveBtn = document.getElementById('saveBtn');
    const exportBtn = document.getElementById('exportBtn');
    
    if (saveBtn) saveBtn.addEventListener('click', saveProject);
    if (exportBtn) exportBtn.addEventListener('click', showExportOptions);
    
    // Project metadata inputs
    setupProjectInputListeners();
    
    // Tab switching
    setupTabSwitching();
    
    // Window events
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOfflineStatus);
}

/**
 * Setup project input listeners
 */
function setupProjectInputListeners() {
    const inputs = [
        { id: 'projectTitle', property: 'title' },
        { id: 'artistName', property: 'artist' },
        { id: 'genre', property: 'genre' },
        { id: 'bpm', property: 'bpm' },
        { id: 'key', property: 'key' },
        { id: 'projectNotes', property: 'notes' },
        { id: 'releaseDate', property: 'releaseDate' }
    ];
    
    inputs.forEach(({ id, property }) => {
        const element = document.getElementById(id);
        if (element) {
            const handler = debounce((e) => {
                window.SongForge.currentProject[property] = e.target.value;
                markProjectModified();
            }, 300);
            
            element.addEventListener('input', handler);
        }
    });
}

/**
 * Setup tab switching functionality
 */
function setupTabSwitching() {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const tabName = btn.dataset.tab;
            switchTab(tabName);
        });
    });
}

/**
 * Setup auto-save functionality
 */
function setupAutoSave() {
    // Auto-save every 30 seconds
    window.SongForge.app.autoSaveInterval = setInterval(() => {
        if (window.SongForge.app.projectModified) {
            autoSaveProject();
        }
    }, 30000);
}

// =========================================
// PROJECT MANAGEMENT
// =========================================

/**
 * Start a new project
 */
function startNewProject() {
    // Initialize with default data
    window.SongForge.currentProject = deepClone(DEFAULT_PROJECT);
    window.SongForge.currentProject.id = generateId();
    window.SongForge.currentProject.workflow = deepClone(DEFAULT_WORKFLOW_STEPS);
    window.SongForge.currentProject.release = deepClone(DEFAULT_RELEASE_STEPS);
    
    // Initialize subsystems
    initializeProjectData();
    
    // Show project interface
    showProjectInterface();
    
    // Mark as modified
    markProjectModified();
    
    showNotification('New project created', 'success');
}

/**
 * Handle new project button click
 */
function handleNewProject() {
    if (window.SongForge.app.projectModified) {
        showConfirmDialog(
            'You have unsaved changes. Are you sure you want to create a new project?',
            () => {
                startNewProject();
            }
        );
    } else {
        startNewProject();
    }
}

/**
 * Initialize project data in subsystems
 */
function initializeProjectData() {
    // Update UI with project data
    updateProjectUI();
    
    // Initialize workflow
    window.SongForge.lyrics.sections = window.SongForge.currentProject.lyrics;
    
    // Clear audio data
    cleanupAudio();
    
    // Render components
    renderWorkflowSteps();
    renderReleaseSteps();
    renderLyricsSections();
}

/**
 * Update project UI with current data
 */
function updateProjectUI() {
    const project = window.SongForge.currentProject;
    
    // Update inputs
    const updates = [
        { id: 'projectTitle', value: project.title },
        { id: 'artistName', value: project.artist },
        { id: 'genre', value: project.genre },
        { id: 'bpm', value: project.bpm },
        { id: 'key', value: project.key },
        { id: 'projectNotes', value: project.notes },
        { id: 'releaseDate', value: project.releaseDate },
        { id: 'projectDate', value: project.createdDate }
    ];
    
    updates.forEach(({ id, value }) => {
        const element = document.getElementById(id);
        if (element) {
            element.value = value || '';
            if (id === 'projectDate') {
                element.textContent = value || '';
            }
        }
    });
    
    // Update title
    if (project.title) {
        document.title = `${project.title} - SongForge`;
    } else {
        document.title = 'SongForge - Ultimate Track Creation Assistant';
    }
}

/**
 * Show project interface
 */
function showProjectInterface() {
    const welcomeScreen = document.getElementById('welcomeScreen');
    const projectInterface = document.getElementById('projectInterface');
    
    if (welcomeScreen) welcomeScreen.classList.add('hidden');
    if (projectInterface) projectInterface.classList.remove('hidden');
}

/**
 * Mark project as modified
 */
function markProjectModified() {
    window.SongForge.app.projectModified = true;
    window.SongForge.currentProject.modifiedDate = new Date().toLocaleDateString();
    
    // Update UI to show unsaved changes
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn && !saveBtn.classList.contains('bg-yellow-500')) {
        saveBtn.classList.remove('bg-green-500');
        saveBtn.classList.add('bg-yellow-500');
        saveBtn.title = 'Unsaved changes';
    }
}

/**
 * Mark project as saved
 */
function markProjectSaved() {
    window.SongForge.app.projectModified = false;
    window.SongForge.app.lastSaveTime = new Date();
    
    // Update UI
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
        saveBtn.classList.remove('bg-yellow-500');
        saveBtn.classList.add('bg-green-500');
        saveBtn.title = 'Project saved';
    }
}

/**
 * Save project
 */
function saveProject() {
    try {
        // Prepare project data for saving
        const projectData = {
            ...window.SongForge.currentProject,
            lyrics: window.SongForge.lyrics.sections,
            recordings: window.SongForge.audio.recordings.map(r => ({
                ...r,
                // Don't save blob data, just metadata
                blob: null,
                url: null
            }))
        };
        
        // Save to localStorage
        const saved = saveToStorage('current-project', projectData);
        
        if (saved) {
            markProjectSaved();
            showNotification('Project saved successfully', 'success');
        } else {
            showNotification('Failed to save project', 'error');
        }
        
    } catch (error) {
        handleError(error, 'Project save');
        showNotification('Error saving project', 'error');
    }
}

/**
 * Auto-save project
 */
function autoSaveProject() {
    try {
        const projectData = {
            ...window.SongForge.currentProject,
            lyrics: window.SongForge.lyrics.sections
        };
        
        saveToStorage('autosave-project', projectData);
        markProjectSaved();
        
        console.log('Project auto-saved');
        
    } catch (error) {
        console.warn('Auto-save failed:', error);
    }
}

/**
 * Load last project from storage
 */
function loadLastProject() {
    try {
        const savedProject = loadFromStorage('current-project');
        
        if (savedProject && savedProject.id) {
            window.SongForge.currentProject = { ...DEFAULT_PROJECT, ...savedProject };
            
            // Ensure required arrays exist
            if (!window.SongForge.currentProject.workflow) {
                window.SongForge.currentProject.workflow = deepClone(DEFAULT_WORKFLOW_STEPS);
            }
            if (!window.SongForge.currentProject.release) {
                window.SongForge.currentProject.release = deepClone(DEFAULT_RELEASE_STEPS);
            }
            if (!window.SongForge.currentProject.lyrics) {
                window.SongForge.currentProject.lyrics = [];
            }
            
            // Show project interface if we have a saved project
            showProjectInterface();
            initializeProjectData();
            
            showNotification('Previous project loaded', 'info');
        }
        
    } catch (error) {
        console.warn('Failed to load previous project:', error);
    }
}

// =========================================
// TAB MANAGEMENT
// =========================================

/**
 * Switch between tabs
 */
function switchTab(tabName) {
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
    
    // Show/hide content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
    });
    
    const activeContent = document.getElementById(`${tabName}Tab`);
    if (activeContent) {
        activeContent.classList.remove('hidden');
        activeContent.classList.add('fade-in');
    }
    
    window.SongForge.app.currentTab = tabName;
    
    // Tab-specific initialization
    handleTabSwitch(tabName);
}

/**
 * Handle tab-specific logic when switching
 */
function handleTabSwitch(tabName) {
    switch (tabName) {
        case 'workflow':
            updateWorkflowProgress();
            break;
        case 'lyrics':
            // Lyrics are already rendered
            break;
        case 'audio':
            updateAudioUI();
            break;
        case 'artwork':
            updateArtworkUI();
            break;
        case 'release':
            updateReleaseProgress();
            break;
    }
}

// =========================================
// WORKFLOW MANAGEMENT
// =========================================

/**
 * Render workflow steps
 */
function renderWorkflowSteps() {
    const container = document.getElementById('workflowSteps');
    if (!container) return;
    
    container.innerHTML = '';
    
    const sortedSteps = [...window.SongForge.currentProject.workflow]
        .sort((a, b) => a.order - b.order);
    
    sortedSteps.forEach(step => {
        const stepElement = createWorkflowStepElement(step);
        container.appendChild(stepElement);
    });
    
    lucide.createIcons();
}

/**
 * Create workflow step element
 */
function createWorkflowStepElement(step) {
    const element = document.createElement('div');
    element.className = `workflow-step ${step.completed ? 'completed' : ''}`;
    element.dataset.stepId = step.id;
    
    element.innerHTML = `
        <label class="flex items-center cursor-pointer flex-1">
            <input type="checkbox" 
                   ${step.completed ? 'checked' : ''} 
                   onchange="toggleWorkflowStep(${step.id})"
                   class="mr-3 text-primary focus:ring-primary custom-checkbox">
            <span class="step-title flex-1 ${step.completed ? 'line-through text-gray-500' : ''}">${step.title}</span>
        </label>
        <div class="flex items-center space-x-2 ml-3">
            ${step.notes ? `
                <span class="text-xs text-blue-500 bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded" title="${step.notes}">
                    <i data-lucide="sticky-note" class="w-3 h-3"></i>
                </span>
            ` : ''}
            <button onclick="editWorkflowStep(${step.id})" 
                    class="text-gray-400 hover:text-primary transition-colors"
                    title="Edit step">
                <i data-lucide="edit" class="w-4 h-4"></i>
            </button>
        </div>
    `;
    
    return element;
}

/**
 * Toggle workflow step completion
 */
function toggleWorkflowStep(stepId) {
    const step = window.SongForge.currentProject.workflow.find(s => s.id === stepId);
    if (step) {
        step.completed = !step.completed;
        
        // Re-render to update UI
        renderWorkflowSteps();
        updateWorkflowProgress();
        markProjectModified();
        
        const action = step.completed ? 'completed' : 'marked incomplete';
        showNotification(`"${step.title}" ${action}`, 'success', 2000);
    }
}

/**
 * Edit workflow step
 */
function editWorkflowStep(stepId) {
    const step = window.SongForge.currentProject.workflow.find(s => s.id === stepId);
    if (!step) return;
    
    const content = `
        <div class="space-y-4">
            <div>
                <label class="block text-sm font-medium mb-1">Step Title</label>
                <input type="text" id="stepTitle" value="${step.title}" 
                       class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-base">
            </div>
            <div>
                <label class="block text-sm font-medium mb-1">Notes</label>
                <textarea id="stepNotes" placeholder="Add notes, deadlines, or details about this step..." 
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
    
    showModal(`Edit Step: ${step.title}`, content);
}

/**
 * Update workflow step
 */
function updateWorkflowStep(stepId) {
    const step = window.SongForge.currentProject.workflow.find(s => s.id === stepId);
    const titleInput = document.getElementById('stepTitle');
    const notesTextarea = document.getElementById('stepNotes');
    const completedCheckbox = document.getElementById('stepCompleted');
    
    if (step && titleInput && notesTextarea && completedCheckbox) {
        const newTitle = titleInput.value.trim();
        
        if (!newTitle) {
            showNotification('Step title cannot be empty', 'error');
            return;
        }
        
        step.title = newTitle;
        step.notes = notesTextarea.value.trim();
        step.completed = completedCheckbox.checked;
        
        renderWorkflowSteps();
        updateWorkflowProgress();
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
        window.SongForge.currentProject.workflow = window.SongForge.currentProject.workflow
            .filter(s => s.id !== stepId);
        
        renderWorkflowSteps();
        updateWorkflowProgress();
        markProjectModified();
        closeModal();
        
        showNotification('Workflow step deleted', 'info');
    });
}

/**
 * Update workflow progress
 */
function updateWorkflowProgress() {
    const totalSteps = window.SongForge.currentProject.workflow.length;
    const completedSteps = window.SongForge.currentProject.workflow.filter(s => s.completed).length;
    const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
    
    // Update progress in UI if element exists
    const progressElement = document.getElementById('workflowProgress');
    if (progressElement) {
        progressElement.innerHTML = `
            <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium">Progress</span>
                <span class="text-sm text-gray-600 dark:text-gray-400">${completedSteps}/${totalSteps} completed</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progress}%"></div>
            </div>
        `;
    }
}

/**
 * Add custom workflow step
 */
function addCustomWorkflowStep() {
    showInputDialog(
        'Add Custom Step',
        'Enter step title...',
        (title) => {
            const newStep = {
                id: Math.max(...window.SongForge.currentProject.workflow.map(s => s.id), 0) + 1,
                title: title,
                completed: false,
                notes: '',
                order: window.SongForge.currentProject.workflow.length
            };
            
            window.SongForge.currentProject.workflow.push(newStep);
            renderWorkflowSteps();
            markProjectModified();
            
            showNotification('Custom step added', 'success');
        }
    );
}

// Setup add step button
const addStepBtn = document.getElementById('addStepBtn');
if (addStepBtn) {
    addStepBtn.addEventListener('click', addCustomWorkflowStep);
}

// =========================================
// RELEASE MANAGEMENT
// =========================================

/**
 * Render release steps
 */
function renderReleaseSteps() {
    const container = document.getElementById('releaseSteps');
    if (!container) return;
    
    container.innerHTML = '';
    
    const sortedSteps = [...window.SongForge.currentProject.release]
        .sort((a, b) => a.order - b.order);
    
    sortedSteps.forEach(step => {
        const stepElement = createReleaseStepElement(step);
        container.appendChild(stepElement);
    });
    
    lucide.createIcons();
}

/**
 * Create release step element
 */
function createReleaseStepElement(step) {
    const element = document.createElement('div');
    element.className = `workflow-step ${step.completed ? 'completed' : ''}`;
    element.dataset.stepId = step.id;
    
    element.innerHTML = `
        <label class="flex items-center cursor-pointer flex-1">
            <input type="checkbox" 
                   ${step.completed ? 'checked' : ''} 
                   onchange="toggleReleaseStep(${step.id})"
                   class="mr-3 text-primary focus:ring-primary custom-checkbox">
            <span class="step-title flex-1 ${step.completed ? 'line-through text-gray-500' : ''}">${step.title}</span>
        </label>
    `;
    
    return element;
}

/**
 * Toggle release step completion
 */
function toggleReleaseStep(stepId) {
    const step = window.SongForge.currentProject.release.find(s => s.id === stepId);
    if (step) {
        step.completed = !step.completed;
        
        renderReleaseSteps();
        updateReleaseProgress();
        markProjectModified();
        
        const action = step.completed ? 'completed' : 'marked incomplete';
        showNotification(`Release step ${action}`, 'success', 2000);
    }
}

/**
 * Update release progress
 */
function updateReleaseProgress() {
    const totalSteps = window.SongForge.currentProject.release.length;
    const completedSteps = window.SongForge.currentProject.release.filter(s => s.completed).length;
    const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;
    
    // Update progress in UI if element exists
    const progressElement = document.getElementById('releaseProgress');
    if (progressElement) {
        progressElement.innerHTML = `
            <div class="flex items-center justify-between mb-2">
                <span class="text-sm font-medium">Release Readiness</span>
                <span class="text-sm text-gray-600 dark:text-gray-400">${completedSteps}/${totalSteps} completed</span>
            </div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progress}%"></div>
            </div>
        `;
    }
}

// =========================================
// ARTWORK MANAGEMENT
// =========================================

/**
 * Update artwork UI
 */
function updateArtworkUI() {
    const preview = document.getElementById('artworkPreview');
    const artwork = window.SongForge.currentProject.artwork;
    
    if (preview && artwork && artwork.url) {
        preview.innerHTML = `<img src="${artwork.url}" alt="Artwork" class="w-full h-full object-cover rounded-lg">`;
    }
}

/**
 * Handle artwork upload
 */
function handleArtworkUpload() {
    const artworkInput = document.getElementById('artworkInput');
    if (artworkInput) {
        artworkInput.click();
    }
}

/**
 * Generate artwork with AI
 */
async function generateArtwork() {
    const promptTextarea = document.getElementById('artPrompt');
    if (!promptTextarea || !promptTextarea.value.trim()) {
        showNotification('Please enter a description for the artwork', 'error');
        return;
    }
    
    const prompt = promptTextarea.value.trim();
    const loadingNotification = showLoadingNotification('Generating artwork...');
    
    try {
        await window.Poe.sendUserMessage(`@GPT-Image-1 ${prompt} --aspect 1:1`, {
            handler: 'artwork-generator',
            stream: false,
            openChat: false
        });
        
    } catch (error) {
        hideLoadingNotification();
        handleError(error, 'Artwork generation');
        showNotification('Failed to generate artwork', 'error');
    }
}

// Register artwork handler
if (window.Poe && window.Poe.registerHandler) {
    window.Poe.registerHandler('artwork-generator', (result) => {
        hideLoadingNotification();
        
        const msg = result.responses[0];
        if (msg.status === 'error') {
            showNotification('Error generating artwork: ' + msg.statusText, 'error');
        } else if (msg.status === 'complete') {
            if (msg.attachments && msg.attachments.length > 0) {
                const imageUrl = msg.attachments[0].url;
                window.SongForge.currentProject.artwork = { 
                    url: imageUrl,
                    generated: true,
                    prompt: document.getElementById('artPrompt').value
                };
                
                updateArtworkUI();
                markProjectModified();
                showNotification('Artwork generated successfully!', 'success');
            } else {
                showNotification('No artwork was generated', 'error');
            }
        }
    });
}

// Setup artwork event listeners
const uploadArtBtn = document.getElementById('uploadArtBtn');
const generateArtBtn = document.getElementById('generateArtBtn');
const artworkInput = document.getElementById('artworkInput');

if (uploadArtBtn) uploadArtBtn.addEventListener('click', handleArtworkUpload);
if (generateArtBtn) generateArtBtn.addEventListener('click', generateArtwork);

if (artworkInput) {
    artworkInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            const url = URL.createObjectURL(file);
            window.SongForge.currentProject.artwork = { 
                file: file, 
                url: url,
                uploaded: true
            };
            updateArtworkUI();
            markProjectModified();
            showNotification('Artwork uploaded successfully', 'success');
        } else {
            showNotification('Please select a valid image file', 'error');
        }
    });
}

// =========================================
// EXPORT FUNCTIONALITY
// =========================================

/**
 * Show export options
 */
function showExportOptions() {
    const content = `
        <div class="space-y-4">
            <h4 class="font-medium">Choose what to export:</h4>
            
            <div class="space-y-3">
                <label class="flex items-center">
                    <input type="checkbox" id="exportProject" checked class="mr-2 text-primary">
                    <span>Complete project file (.json)</span>
                </label>
                <label class="flex items-center">
                    <input type="checkbox" id="exportLyrics" checked class="mr-2 text-primary">
                    <span>Lyrics (.txt)</span>
                </label>
                <label class="flex items-center">
                    <input type="checkbox" id="exportLyricsMarkdown" class="mr-2 text-primary">
                    <span>Lyrics (.md)</span>
                </label>
                <label class="flex items-center">
                    <input type="checkbox" id="exportAudio" ${window.SongForge.audio.recordings.length > 0 ? 'checked' : 'disabled'} class="mr-2 text-primary">
                    <span>Audio recordings ${window.SongForge.audio.recordings.length === 0 ? '(none available)' : ''}</span>
                </label>
                <label class="flex items-center">
                    <input type="checkbox" id="exportArtwork" ${window.SongForge.currentProject.artwork ? 'checked' : 'disabled'} class="mr-2 text-primary">
                    <span>Artwork ${!window.SongForge.currentProject.artwork ? '(none available)' : ''}</span>
                </label>
            </div>
            
            <div class="border-t pt-4">
                <label class="flex items-center mb-2">
                    <input type="radio" name="exportFormat" value="separate" checked class="mr-2 text-primary">
                    <span>Export as separate files</span>
                </label>
                <label class="flex items-center">
                    <input type="radio" name="exportFormat" value="zip" class="mr-2 text-primary">
                    <span>Export as ZIP package</span>
                </label>
            </div>
            
            <div class="flex space-x-3">
                <button onclick="executeExport()" 
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
    
    showModal('Export Project', content);
}

/**
 * Execute export based on selected options
 */
function executeExport() {
    const options = {
        project: document.getElementById('exportProject')?.checked || false,
        lyrics: document.getElementById('exportLyrics')?.checked || false,
        lyricsMarkdown: document.getElementById('exportLyricsMarkdown')?.checked || false,
        audio: document.getElementById('exportAudio')?.checked || false,
        artwork: document.getElementById('exportArtwork')?.checked || false,
        format: document.querySelector('input[name="exportFormat"]:checked')?.value || 'separate'
    };
    
    closeModal();
    
    if (options.format === 'zip') {
        exportAsZip(options);
    } else {
        exportSeparateFiles(options);
    }
}

/**
 * Export separate files
 */
function exportSeparateFiles(options) {
    const project = window.SongForge.currentProject;
    const filename = project.title || 'songforge-project';
    
    if (options.project) {
        const projectData = {
            ...project,
            lyrics: window.SongForge.lyrics.sections,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        downloadFile(JSON.stringify(projectData, null, 2), `${filename}.json`, 'application/json');
    }
    
    if (options.lyrics) {
        exportLyricsAsText();
    }
    
    if (options.lyricsMarkdown) {
        exportLyricsAsMarkdown();
    }
    
    if (options.audio && window.SongForge.audio.recordings.length > 0) {
        window.SongForge.audio.recordings.forEach((recording, index) => {
            const a = document.createElement('a');
            a.href = recording.url;
            a.download = `${filename}-recording-${index + 1}.webm`;
            a.click();
        });
    }
    
    if (options.artwork && project.artwork) {
        if (project.artwork.file) {
            const a = document.createElement('a');
            a.href = project.artwork.url;
            a.download = `${filename}-artwork.jpg`;
            a.click();
        }
    }
    
    showNotification('Export completed', 'success');
}

/**
 * Export as ZIP package (placeholder for future implementation)
 */
function exportAsZip(options) {
    showNotification('ZIP export feature coming soon!', 'info');
    
    // Future implementation would use JSZip or similar library
    // to create a comprehensive ZIP package
}

// =========================================
// AUDIO UI UPDATES
// =========================================

/**
 * Update audio UI when switching to audio tab
 */
function updateAudioUI() {
    // Update recording list
    renderRecordings();
    
    // Update beat info if loaded
    if (window.SongForge.currentProject.beatFile) {
        const beatInfo = document.getElementById('beatInfo');
        const beatDropZone = document.getElementById('beatDropZone');
        
        if (beatInfo && beatDropZone) {
            document.getElementById('beatName').textContent = window.SongForge.currentProject.beatFile.name;
            beatInfo.classList.remove('hidden');
            beatDropZone.style.display = 'none';
        }
    }
}

// =========================================
// WINDOW EVENT HANDLERS
// =========================================

/**
 * Handle before window unload
 */
function handleBeforeUnload(e) {
    if (window.SongForge.app.projectModified) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
    }
}

/**
 * Handle online status
 */
function handleOnlineStatus() {
    showNotification('Back online', 'success', 2000);
}

/**
 * Handle offline status
 */
function handleOfflineStatus() {
    showNotification('You are offline. Changes will be saved locally.', 'info', 3000);
}

// =========================================
// GLOBAL FUNCTIONS FOR HTML ONCLICK
// =========================================

// These functions need to be global for HTML onclick attributes
window.toggleWorkflowStep = toggleWorkflowStep;
window.editWorkflowStep = editWorkflowStep;
window.updateWorkflowStep = updateWorkflowStep;
window.deleteWorkflowStep = deleteWorkflowStep;
window.toggleReleaseStep = toggleReleaseStep;
window.updateSectionTitle = updateSectionTitle;
window.updateSectionContent = updateSectionContent;
window.updateSectionStats = updateSectionStats;
window.deleteSection = deleteSection;
window.duplicateSection = duplicateSection;
window.showSectionOptions = showSectionOptions;
window.updateSectionOptions = updateSectionOptions;
window.showRhymeHelper = showRhymeHelper;
window.showAIAssist = showAIAssist;
window.addSection = addSection;
window.createNewSection = createNewSection;
window.playRecording = playRecording;
window.setAsVocal = setAsVocal;
window.downloadRecording = downloadRecording;
window.deleteRecording = deleteRecording;
window.findRhymes = findRhymes;
window.requestAIAssist = requestAIAssist;
window.applyAIResponse = applyAIResponse;
window.copyAIResponse = copyAIResponse;
window.insertWordAtCursor = insertWordAtCursor;
window.requestGeneralAIHelp = requestGeneralAIHelp;
window.copyGeneralAIResponse = copyGeneralAIResponse;
window.executeExport = executeExport;
window.saveProject = saveProject;
window.startNewProject = startNewProject;

// Make key functions available globally
window.showModal = showModal;
window.closeModal = closeModal;
window.showConfirmDialog = showConfirmDialog;
window.showInputDialog = showInputDialog;
window.submitDialogInput = submitDialogInput;
window.showNotification = showNotification;
window.toggleDarkMode = toggleDarkMode;
window.switchTab = switchTab;
window.handleBeatFile = handleBeatFile;
window.removeBeatFile = removeBeatFile;
window.toggleRecording = toggleRecording;
window.playAudio = playAudio;
window.pauseAudio = pauseAudio;
window.stopAudio = stopAudio;
window.togglePlayback = togglePlayback;
window.exportLyricsAsText = exportLyricsAsText;
window.exportLyricsAsMarkdown = exportLyricsAsMarkdown;

console.log('SongForge main application loaded');
