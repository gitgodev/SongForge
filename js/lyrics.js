// =========================================
// ENHANCED LYRICS SYSTEM FOR SONGFORGE
// =========================================

// Enhanced lyrics state
window.SongForge = window.SongForge || {};
window.SongForge.lyrics = {
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

// Word banks for AI suggestions
const WORD_BANKS = {
    emotions: ['love', 'hate', 'joy', 'pain', 'hope', 'fear', 'anger', 'peace', 'trust', 'doubt'],
    actions: ['run', 'fly', 'climb', 'fall', 'rise', 'fight', 'dance', 'sing', 'write', 'dream'],
    objects: ['star', 'moon', 'fire', 'water', 'mountain', 'ocean', 'city', 'road', 'bridge', 'door'],
    abstract: ['freedom', 'destiny', 'time', 'space', 'truth', 'memory', 'soul', 'spirit', 'mind', 'heart'],
    colors: ['red', 'blue', 'green', 'gold', 'silver', 'black', 'white', 'purple', 'orange', 'yellow']
};

// =========================================
// ENHANCED LYRICS CONTENT LOADING
// =========================================

/**
 * Load enhanced lyrics content
 */
function loadEnhancedLyricsContent() {
    const tabContent = document.getElementById('tabContent');
    if (!tabContent) return;
    
    tabContent.innerHTML = `
        <div class="grid lg:grid-cols-4 gap-6">
            <!-- Main Lyrics Editor -->
            <div class="lg:col-span-2">
                <div class="bg-light-panel dark:bg-dark-panel rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-lg font-semibold">Lyrics Editor</h3>
                        <div class="flex space-x-2">
                            <button id="addLyricsSection" class="text-primary hover:text-primary-dark transition-colors">
                                <i data-lucide="plus" class="w-4 h-4 mr-1 inline"></i>
                                Add Section
                            </button>
                            <button id="importLyricsBtn" class="bg-secondary hover:bg-secondary-dark text-white px-3 py-1 rounded text-sm transition-colors">
                                <i data-lucide="upload" class="w-3 h-3 mr-1 inline"></i>
                                Import
                            </button>
                        </div>
                    </div>
                    
                    <div id="lyricsSections" class="space-y-4 mb-6">
                        <!-- Lyrics sections will be rendered here -->
                    </div>
                    
                    <!-- Combined View -->
                    <div class="border-t border-gray-200 dark:border-gray-700 pt-6">
                        <div class="flex justify-between items-center mb-4">
                            <h4 class="font-medium">Combined Lyrics</h4>
                            <button id="updateCombinedBtn" class="bg-primary hover:bg-primary-dark text-white px-3 py-1 rounded text-sm transition-colors">
                                Update Combined
                            </button>
                        </div>
                        <textarea id="combinedLyrics" placeholder="Click 'Update Combined' to merge all sections..." 
                                 class="w-full h-48 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-light-bg dark:bg-dark-bg resize-none custom-scrollbar text-base"></textarea>
                        <div class="mt-2 flex space-x-2">
                            <button id="exportCombinedTxt" class="text-sm bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded transition-colors">
                                Export TXT
                            </button>
                            <button id="exportCombinedMd" class="text-sm bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded transition-colors">
                                Export Markdown
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- AI Rhyme Builder -->
            <div class="space-y-6">
                <div class="bg-light-panel dark:bg-dark-panel rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                    <h3 class="text-lg font-semibold mb-4">AI Rhyme Builder</h3>
                    
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium mb-2">Target Word</label>
                            <input type="text" id="rhymeTargetWord" placeholder="Enter word to rhyme..." 
                                   class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-light-bg dark:bg-dark-bg text-base">
                        </div>
                        
                        <!-- Rhyme Settings Sliders -->
                        <div class="space-y-3">
                            <div>
                                <label class="flex justify-between text-sm font-medium mb-1">
                                    <span>Rhyme Density</span>
                                    <span id="rhymeDensityValue">5</span>
                                </label>
                                <input type="range" id="rhymeDensity" min="1" max="10" value="5" 
                                       class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700">
                            </div>
                            
                            <div>
                                <label class="flex justify-between text-sm font-medium mb-1">
                                    <span>Layered Metaphors</span>
                                    <span id="layeredMetaphorsValue">3</span>
                                </label>
                                <input type="range" id="layeredMetaphors" min="1" max="10" value="3" 
                                       class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700">
                            </div>
                            
                            <div>
                                <label class="flex justify-between text-sm font-medium mb-1">
                                    <span>Puns</span>
                                    <span id="punsValue">2</span>
                                </label>
                                <input type="range" id="puns" min="0" max="10" value="2" 
                                       class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700">
                            </div>
                            
                            <div>
                                <label class="flex justify-between text-sm font-medium mb-1">
                                    <span>Internal Rhymes</span>
                                    <span id="internalRhymesValue">4</span>
                                </label>
                                <input type="range" id="internalRhymes" min="1" max="10" value="4" 
                                       class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700">
                            </div>
                            
                            <div>
                                <label class="flex justify-between text-sm font-medium mb-1">
                                    <span>Double Entendres</span>
                                    <span id="doubleEntendresValue">2</span>
                                </label>
                                <input type="range" id="doubleEntendres" min="0" max="10" value="2" 
                                       class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700">
                            </div>
                            
                            <div>
                                <label class="flex justify-between text-sm font-medium mb-1">
                                    <span>Assonance</span>
                                    <span id="assonanceValue">3</span>
                                </label>
                                <input type="range" id="assonance" min="1" max="10" value="3" 
                                       class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700">
                            </div>
                            
                            <div>
                                <label class="flex justify-between text-sm font-medium mb-1">
                                    <span>Consonance</span>
                                    <span id="consonanceValue">3</span>
                                </label>
                                <input type="range" id="consonance" min="1" max="10" value="3" 
                                       class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700">
                            </div>
                            
                            <div class="flex items-center">
                                <input type="checkbox" id="radioFriendly" checked 
                                       class="mr-2 text-primary focus:ring-primary">
                                <label for="radioFriendly" class="text-sm">Radio Friendly</label>
                            </div>
                        </div>
                        
                        <button id="generateRhymes" class="w-full bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-lg transition-colors">
                            Generate Rhymes
                        </button>
                        
                        <div id="rhymeResults" class="hidden">
                            <h4 class="font-medium mb-2">Suggestions:</h4>
                            <div id="rhymesList" class="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                                <!-- Rhyme suggestions will appear here -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Lyrics Tools -->
            <div class="space-y-6">
                <div class="bg-light-panel dark:bg-dark-panel rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                    <h3 class="text-lg font-semibold mb-4">Lyrics Tools</h3>
                    
                    <div class="space-y-3">
                        <button id="aiLyricsAssist" class="w-full text-left p-3 bg-light-bg dark:bg-dark-bg rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700">
                            <i data-lucide="sparkles" class="w-4 h-4 mr-2 inline text-primary"></i>
                            AI Writing Assistant
                        </button>
                        
                        <button id="synonymFinder" class="w-full text-left p-3 bg-light-bg dark:bg-dark-bg rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700">
                            <i data-lucide="book-open" class="w-4 h-4 mr-2 inline text-primary"></i>
                            Synonym Finder
                        </button>
                        
                        <button id="wordSuggestor" class="w-full text-left p-3 bg-light-bg dark:bg-dark-bg rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700">
                            <i data-lucide="lightbulb" class="w-4 h-4 mr-2 inline text-primary"></i>
                            Word Suggestions
                        </button>
                        
                        <button id="syllableCounter" class="w-full text-left p-3 bg-light-bg dark:bg-dark-bg rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700">
                            <i data-lucide="hash" class="w-4 h-4 mr-2 inline text-primary"></i>
                            Syllable Counter
                        </button>
                    </div>
                </div>
                
                <!-- Import from Projects -->
                <div class="bg-light-panel dark:bg-dark-panel rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                    <h3 class="text-lg font-semibold mb-4">Import from Projects</h3>
                    
                    <div id="importableProjects" class="space-y-2 mb-4 max-h-32 overflow-y-auto custom-scrollbar">
                        <!-- Available projects will appear here -->
                    </div>
                    
                    <button id="refreshProjectsList" class="w-full bg-secondary hover:bg-secondary-dark text-white py-2 px-4 rounded-lg transition-colors text-sm">
                        Refresh Projects List
                    </button>
                </div>
                
                <!-- Stats -->
                <div class="bg-light-panel dark:bg-dark-panel rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                    <h3 class="text-lg font-semibold mb-4">Lyrics Stats</h3>
                    
                    <div id="lyricsStats" class="space-y-2 text-sm">
                        <div class="flex justify-between">
                            <span>Total Words:</span>
                            <span id="totalWords">0</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Total Lines:</span>
                            <span id="totalLines">0</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Sections:</span>
                            <span id="totalSections">0</span>
                        </div>
                        <div class="flex justify-between">
                            <span>Avg Words/Line:</span>
                            <span id="avgWordsPerLine">0</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Initialize enhanced lyrics
    initializeEnhancedLyrics();
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// =========================================
// ENHANCED LYRICS INITIALIZATION
// =========================================

/**
 * Initialize enhanced lyrics system
 */
function initializeEnhancedLyrics() {
    setupEnhancedLyricsEventListeners();
    loadLyricsData();
    setupRhymeSettings();
    loadImportableProjects();
    renderLyricsSections();
}

/**
 * Setup enhanced lyrics event listeners
 */
function setupEnhancedLyricsEventListeners() {
    // Main buttons
    const addLyricsSection = document.getElementById('addLyricsSection');
    const importLyricsBtn = document.getElementById('importLyricsBtn');
    const updateCombinedBtn = document.getElementById('updateCombinedBtn');
    const generateRhymes = document.getElementById('generateRhymes');
    
    if (addLyricsSection) addLyricsSection.addEventListener('click', showAddSectionDialog);
    if (importLyricsBtn) importLyricsBtn.addEventListener('click', showImportDialog);
    if (updateCombinedBtn) updateCombinedBtn.addEventListener('click', updateCombinedLyrics);
    if (generateRhymes) generateRhymes.addEventListener('click', generateAdvancedRhymes);
    
    // Export buttons
    const exportCombinedTxt = document.getElementById('exportCombinedTxt');
    const exportCombinedMd = document.getElementById('exportCombinedMd');
    
    if (exportCombinedTxt) exportCombinedTxt.addEventListener('click', () => exportCombined('txt'));
    if (exportCombinedMd) exportCombinedMd.addEventListener('click', () => exportCombined('md'));
    
    // Tool buttons
    const aiLyricsAssist = document.getElementById('aiLyricsAssist');
    const synonymFinder = document.getElementById('synonymFinder');
    const wordSuggestor = document.getElementById('wordSuggestor');
    const syllableCounter = document.getElementById('syllableCounter');
    const refreshProjectsList = document.getElementById('refreshProjectsList');
    
    if (aiLyricsAssist) aiLyricsAssist.addEventListener('click', showAILyricsAssistant);
    if (synonymFinder) synonymFinder.addEventListener('click', showSynonymFinder);
    if (wordSuggestor) wordSuggestor.addEventListener('click', showWordSuggestor);
    if (syllableCounter) syllableCounter.addEventListener('click', showSyllableCounter);
    if (refreshProjectsList) refreshProjectsList.addEventListener('click', loadImportableProjects);
    
    // Combined lyrics listener
    const combinedLyrics = document.getElementById('combinedLyrics');
    if (combinedLyrics) {
        combinedLyrics.addEventListener('input', (e) => {
            window.SongForge.lyricsEnhanced.combinedText = e.target.value;
            markProjectModified();
        });
    }
}

/**
 * Setup rhyme settings sliders
 */
function setupRhymeSettings() {
    const settings = [
        'rhymeDensity', 'layeredMetaphors', 'puns', 'internalRhymes', 
        'doubleEntendres', 'assonance', 'consonance'
    ];
    
    settings.forEach(setting => {
        const slider = document.getElementById(setting);
        const valueDisplay = document.getElementById(setting + 'Value');
        
        if (slider && valueDisplay) {
            slider.addEventListener('input', (e) => {
                const value = e.target.value;
                valueDisplay.textContent = value;
                
                // Update settings object
                const settingKey = setting.replace(/([A-Z])/g, (match, letter) => 
                    letter.toLowerCase()
                ).replace(/^(.)/, (match, letter) => letter.toLowerCase());
                
                window.SongForge.lyricsEnhanced.rhymeSettings[settingKey] = parseInt(value);
            });
        }
    });
    
    // Radio friendly toggle
    const radioFriendly = document.getElementById('radioFriendly');
    if (radioFriendly) {
        radioFriendly.addEventListener('change', (e) => {
            window.SongForge.lyricsEnhanced.rhymeSettings.radioFriendly = e.target.checked;
        });
    }
}

/**
 * Load lyrics data from current project
 */
function loadLyricsData() {
    if (!window.SongForge.app.currentProject) return;
    
    // Load existing lyrics or create default structure
    if (window.SongForge.app.currentProject.lyrics && window.SongForge.app.currentProject.lyrics.length > 0) {
        window.SongForge.lyricsEnhanced.sections = window.SongForge.app.currentProject.lyrics;
    } else {
        // Create default structure
        window.SongForge.lyricsEnhanced.sections = [
            { id: generateId(), type: 'verse', title: 'Verse 1', content: '', wordCount: 0, lineCount: 0, order: 0 },
            { id: generateId(), type: 'chorus', title: 'Chorus', content: '', wordCount: 0, lineCount: 0, order: 1 },
            { id: generateId(), type: 'verse', title: 'Verse 2', content: '', wordCount: 0, lineCount: 0, order: 2 },
            { id: generateId(), type: 'chorus', title: 'Chorus', content: '', wordCount: 0, lineCount: 0, order: 3 }
        ];
        
        // Save to project
        window.SongForge.app.currentProject.lyrics = window.SongForge.lyricsEnhanced.sections;
    }
    
    updateLyricsStats();
}

// =========================================
// LYRICS SECTIONS MANAGEMENT
// =========================================

/**
 * Render lyrics sections
 */
function renderLyricsSections() {
    const container = document.getElementById('lyricsSections');
    if (!container) return;
    
    container.innerHTML = '';
    
    const sortedSections = [...window.SongForge.lyricsEnhanced.sections]
        .sort((a, b) => a.order - b.order);
    
    sortedSections.forEach(section => {
        const sectionElement = createLyricsSectionElement(section);
        container.appendChild(sectionElement);
    });
    
    updateLyricsStats();
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

/**
 * Create lyrics section element
 */
function createLyricsSectionElement(section) {
    const element = document.createElement('div');
    element.className = 'bg-light-bg dark:bg-dark-bg rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:border-primary transition-colors';
    element.dataset.sectionId = section.id;
    
    element.innerHTML = `
        <div class="flex items-center justify-between mb-3">
            <div class="flex items-center space-x-3">
                <button class="drag-handle cursor-move p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <i data-lucide="grip-vertical" class="w-4 h-4"></i>
                </button>
                <input type="text" value="${section.title}" 
                       class="font-medium bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-primary rounded px-2 py-1 text-base"
                       onchange="updateSectionTitle('${section.id}', this.value)">
                <span class="text-xs px-2 py-1 bg-primary bg-opacity-20 text-primary rounded">${section.type}</span>
            </div>
            <div class="flex items-center space-x-2">
                <span class="text-xs text-gray-500">${section.wordCount || 0} words</span>
                <button onclick="duplicateSection('${section.id}')" class="text-gray-400 hover:text-primary transition-colors" title="Duplicate">
                    <i data-lucide="copy" class="w-4 h-4"></i>
                </button>
                <button onclick="deleteSection('${section.id}')" class="text-gray-400 hover:text-red-500 transition-colors" title="Delete">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
            </div>
        </div>
        
        <textarea placeholder="Write your lyrics here..." 
                 class="w-full h-24 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-light-panel dark:bg-dark-panel resize-none text-base"
                 onchange="updateSectionContent('${section.id}', this.value)"
                 oninput="updateSectionStats('${section.id}', this.value)">${section.content || ''}</textarea>
    `;
    
    return element;
}

/**
 * Update section title
 */
function updateSectionTitle(sectionId, title) {
    const section = window.SongForge.lyricsEnhanced.sections.find(s => s.id === sectionId);
    if (section && title.trim()) {
        section.title = title.trim();
        saveLyricsToProject();
        markProjectModified();
    }
}

/**
 * Update section content
 */
function updateSectionContent(sectionId, content) {
    const section = window.SongForge.lyricsEnhanced.sections.find(s => s.id === sectionId);
    if (section) {
        section.content = content;
        updateSectionStats(sectionId, content);
        saveLyricsToProject();
        markProjectModified();
    }
}

/**
 * Update section statistics
 */
function updateSectionStats(sectionId, content) {
    const section = window.SongForge.lyricsEnhanced.sections.find(s => s.id === sectionId);
    if (!section) return;
    
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    const lines = content.split('\n').filter(line => line.trim()).length;
    
    section.wordCount = words;
    section.lineCount = lines;
    
    // Update word count display
    const sectionElement = document.querySelector(`[data-section-id="${sectionId}"]`);
    if (sectionElement) {
        const wordCountSpan = sectionElement.querySelector('.text-xs.text-gray-500');
        if (wordCountSpan) {
            wordCountSpan.textContent = `${words} words`;
        }
    }
    
    updateLyricsStats();
}

/**
 * Duplicate section
 */
function duplicateSection(sectionId) {
    const section = window.SongForge.lyricsEnhanced.sections.find(s => s.id === sectionId);
    if (!section) return;
    
    const duplicatedSection = {
        ...deepClone(section),
        id: generateId(),
        title: `${section.title} (Copy)`,
        order: section.order + 1
    };
    
    // Adjust order of subsequent sections
    window.SongForge.lyricsEnhanced.sections.forEach(s => {
        if (s.order > section.order) {
            s.order++;
        }
    });
    
    window.SongForge.lyricsEnhanced.sections.push(duplicatedSection);
    saveLyricsToProject();
    renderLyricsSections();
    markProjectModified();
    
    showNotification('Section duplicated', 'success');
}

/**
 * Delete section
 */
function deleteSection(sectionId) {
    showConfirmDialog('Are you sure you want to delete this section?', () => {
        window.SongForge.lyricsEnhanced.sections = window.SongForge.lyricsEnhanced.sections
            .filter(s => s.id !== sectionId);
        
        // Reorder remaining sections
        window.SongForge.lyricsEnhanced.sections
            .sort((a, b) => a.order - b.order)
            .forEach((section, index) => {
                section.order = index;
            });
        
        saveLyricsToProject();
        renderLyricsSections();
        markProjectModified();
        
        showNotification('Section deleted', 'info');
    });
}

/**
 * Show add section dialog
 */
function showAddSectionDialog() {
    const sectionTypes = [
        { value: 'verse', name: 'Verse' },
        { value: 'chorus', name: 'Chorus' },
        { value: 'bridge', name: 'Bridge' },
        { value: 'intro', name: 'Intro' },
        { value: 'outro', name: 'Outro' },
        { value: 'hook', name: 'Hook' },
        { value: 'prechorus', name: 'Pre-Chorus' },
        { value: 'interlude', name: 'Interlude' }
    ];
    
    const typeOptions = sectionTypes.map(type => 
        `<option value="${type.value}">${type.name}</option>`
    ).join('');
    
    const content = `
        <div class="space-y-4">
            <h3 class="text-lg font-semibold">Add New Section</h3>
            
            <div>
                <label class="block text-sm font-medium mb-1">Section Type</label>
                <select id="newSectionType" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-base">
                    ${typeOptions}
                </select>
            </div>
            
            <div>
                <label class="block text-sm font-medium mb-1">Section Title</label>
                <input type="text" id="newSectionTitle" placeholder="e.g., Verse 3, Chorus, Bridge..." 
                       class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-base">
            </div>
            
            <div class="flex space-x-3">
                <button onclick="addNewSection()" 
                        class="flex-1 bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-lg transition-colors">
                    Add Section
                </button>
                <button onclick="closeModal()" 
                        class="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors">
                    Cancel
                </button>
            </div>
        </div>
    `;
    
    showModal('Add Section', content);
}

/**
 * Add new section
 */
function addNewSection() {
    const typeSelect = document.getElementById('newSectionType');
    const titleInput = document.getElementById('newSectionTitle');
    
    if (!typeSelect || !titleInput) return;
    
    const type = typeSelect.value;
    const title = titleInput.value.trim();
    
    if (!title) {
        showNotification('Please enter a section title', 'error');
        return;
    }
    
    const newSection = {
        id: generateId(),
        type: type,
        title: title,
        content: '',
        wordCount: 0,
        lineCount: 0,
        order: window.SongForge.lyricsEnhanced.sections.length
    };
    
    window.SongForge.lyricsEnhanced.sections.push(newSection);
    saveLyricsToProject();
    renderLyricsSections();
    markProjectModified();
    closeModal();
    
    showNotification('Section added', 'success');
}

// =========================================
// ADVANCED RHYME GENERATION
// =========================================

/**
 * Generate advanced rhymes with custom settings
 */
function generateAdvancedRhymes() {
    const targetWord = document.getElementById('rhymeTargetWord');
    if (!targetWord || !targetWord.value.trim()) {
        showNotification('Please enter a word to rhyme with', 'error');
        return;
    }
    
    const word = targetWord.value.trim().toLowerCase();
    const settings = window.SongForge.lyricsEnhanced.rhymeSettings;
    
    showLoadingNotification('Generating advanced rhymes...');
    
    // Create prompt based on settings
    const prompt = createRhymePrompt(word, settings);
    
    // Use built-in rhyme generation for now
    generateClientSideRhymes(word, settings);
}

/**
 * Create rhyme prompt for AI
 */
function createRhymePrompt(word, settings) {
    let prompt = `Generate creative rhymes and wordplay for "${word}" with these specifications:\n`;
    prompt += `- Rhyme density: ${settings.rhymeDensity}/10\n`;
    prompt += `- Layered metaphors: ${settings.layeredMetaphors}/10\n`;
    prompt += `- Puns: ${settings.puns}/10\n`;
    prompt += `- Internal rhymes: ${settings.internalRhymes}/10\n`;
    prompt += `- Double entendres: ${settings.doubleEntendres}/10\n`;
    prompt += `- Assonance: ${settings.assonance}/10\n`;
    prompt += `- Consonance: ${settings.consonance}/10\n`;
    prompt += `- Radio friendly: ${settings.radioFriendly ? 'Yes' : 'No'}\n\n`;
    prompt += `Provide creative suggestions that incorporate these elements.`;
    
    return prompt;
}

/**
 * Generate client-side rhymes (fallback)
 */
function generateClientSideRhymes(word, settings) {
    hideLoadingNotification();
    
    // Simple rhyme patterns based on endings
    const rhymes = [];
    const wordEnding = word.slice(-2);
    
    // Basic rhymes
    const basicRhymes = generateBasicRhymes(word);
    rhymes.push(...basicRhymes);
    
    // Add slant rhymes
    const slantRhymes = generateSlantRhymes(word);
    rhymes.push(...slantRhymes);
    
    // Add internal rhymes based on settings
    if (settings.internalRhymes > 5) {
        const internalRhymes = generateInternalRhymes(word);
        rhymes.push(...internalRhymes);
    }
    
    // Filter for radio friendly if enabled
    let filteredRhymes = rhymes;
    if (settings.radioFriendly) {
        filteredRhymes = rhymes.filter(rhyme => isRadioFriendly(rhyme));
    }
    
    displayRhymeResults(filteredRhymes.slice(0, 20)); // Show top 20
}

/**
 * Generate basic rhymes
 */
function generateBasicRhymes(word) {
    const rhymePatterns = {
        'ight': ['night', 'light', 'sight', 'flight', 'right', 'fight', 'might'],
        'ove': ['love', 'above', 'dove', 'shove', 'grove'],
        'ay': ['day', 'way', 'say', 'play', 'stay', 'gray', 'may'],
        'ound': ['sound', 'ground', 'round', 'found', 'bound', 'crown'],
        'eart': ['heart', 'start', 'part', 'smart', 'art', 'chart'],
        'ime': ['time', 'rhyme', 'climb', 'prime', 'mime', 'chime']
    };
    
    const wordEnding = word.slice(-2);
    const results = [];
    
    // Find matching patterns
    for (const [pattern, words] of Object.entries(rhymePatterns)) {
        if (word.endsWith(pattern.slice(-2))) {
            results.push(...words.filter(w => w !== word));
        }
    }
    
    return results;
}

/**
 * Generate slant rhymes
 */
function generateSlantRhymes(word) {
    const slantPatterns = {
        'vowel_sounds': {
            'a': ['fate', 'hate', 'late', 'gate', 'mate'],
            'e': ['meet', 'beat', 'heat', 'seat', 'neat'],
            'i': ['light', 'bright', 'sight', 'night', 'fight'],
            'o': ['hope', 'scope', 'rope', 'cope', 'slope'],
            'u': ['blue', 'true', 'crew', 'flew', 'knew']
        }
    };
    
    // Simple vowel sound matching
    const lastVowel = word.match(/[aeiou]/g)?.pop();
    const results = slantPatterns.vowel_sounds[lastVowel] || [];
    
    return results.filter(w => w !== word);
}

/**
 * Generate internal rhymes
 */
function generateInternalRhymes(word) {
    const syllables = word.match(/[aeiou]+/g) || [];
    const results = [];
    
    // Create compound rhymes
    if (syllables.length > 1) {
        results.push(`in-${word}`, `out-${word}`, `${word}-ing`, `${word}-ed`);
    }
    
    return results;
}

/**
 * Check if word is radio friendly
 */
function isRadioFriendly(word) {
    const explicitWords = ['damn', 'hell', 'ass', 'bitch']; // Basic filter
    return !explicitWords.some(explicit => word.toLowerCase().includes(explicit));
}

/**
 * Display rhyme results
 */
function displayRhymeResults(rhymes) {
    const resultsContainer = document.getElementById('rhymeResults');
    const rhymesList = document.getElementById('rhymesList');
    
    if (!resultsContainer || !rhymesList) return;
    
    if (rhymes.length === 0) {
        rhymesList.innerHTML = '<p class="text-gray-500 text-sm">No rhymes found. Try a different word.</p>';
    } else {
        rhymesList.innerHTML = rhymes.map(rhyme => `
            <div class="p-2 bg-light-panel dark:bg-dark-panel rounded border border-gray-200 dark:border-gray-700 hover:border-primary transition-colors cursor-pointer"
                 onclick="insertRhymeWord('${rhyme}')">
                <span class="font-medium">${rhyme}</span>
            </div>
        `).join('');
    }
    
    resultsContainer.classList.remove('hidden');
}

/**
 * Insert rhyme word into active textarea
 */
function insertRhymeWord(word) {
    const activeElement = document.activeElement;
    
    if (activeElement && activeElement.tagName === 'TEXTAREA') {
        const start = activeElement.selectionStart;
        const end = activeElement.selectionEnd;
        const text = activeElement.value;
        
        const newText = text.substring(0, start) + word + text.substring(end);
        activeElement.value = newText;
        
        // Trigger change event
        activeElement.dispatchEvent(new Event('input'));
        
        // Set cursor position
        const newPosition = start + word.length;
        activeElement.focus();
        activeElement.setSelectionRange(newPosition, newPosition);
        
        showNotification(`"${word}" inserted`, 'success', 1000);
    } else {
        // Copy to clipboard as fallback
        navigator.clipboard.writeText(word).then(() => {
            showNotification(`"${word}" copied to clipboard`, 'info');
        });
    }
}

// =========================================
// COMBINED LYRICS MANAGEMENT
// =========================================

/**
 * Update combined lyrics
 */
function updateCombinedLyrics() {
    const combinedTextarea = document.getElementById('combinedLyrics');
    if (!combinedTextarea) return;
    
    let combinedText = '';
    
    // Get project info
    const project = window.SongForge.app.currentProject;
    if (project.title) {
        combinedText += `${project.title}\n`;
        if (project.artist) combinedText += `Artist: ${project.artist}\n`;
        combinedText += '\n';
    }
    
    // Combine all sections in order
    const sortedSections = [...window.SongForge.lyricsEnhanced.sections]
        .sort((a, b) => a.order - b.order)
        .filter(section => section.content && section.content.trim());
    
    sortedSections.forEach(section => {
        combinedText += `[${section.title}]\n`;
        combinedText += `${section.content}\n\n`;
    });
    
    combinedTextarea.value = combinedText;
    window.SongForge.lyricsEnhanced.combinedText = combinedText;
    
    showNotification('Combined lyrics updated', 'success');
}

/**
 * Export combined lyrics
 */
function exportCombined(format) {
    const combinedText = window.SongForge.lyricsEnhanced.combinedText;
    
    if (!combinedText || !combinedText.trim()) {
        showNotification('No combined lyrics to export. Click "Update Combined" first.', 'error');
        return;
    }
    
    const project = window.SongForge.app.currentProject;
    const filename = project.title || 'combined-lyrics';
    
    if (format === 'md') {
        // Convert to Markdown format
        let markdownText = `# ${project.title || 'Untitled'}\n\n`;
        if (project.artist) markdownText += `**Artist:** ${project.artist}\n\n`;
        
        // Convert sections to Markdown
        const sections = combinedText.split(/$$([^$$]+)\]/);
        for (let i = 1; i < sections.length; i += 2) {
            const sectionTitle = sections[i];
            const sectionContent = sections[i + 1]?.trim();
            if (sectionContent) {
                markdownText += `## ${sectionTitle}\n\n${sectionContent}\n\n`;
            }
        }
        
        downloadFile(markdownText, `${filename}.md`, 'text/markdown');
    } else {
        downloadFile(combinedText, `${filename}.txt`, 'text/plain');
    }
    
    showNotification(`Combined lyrics exported as ${format.toUpperCase()}`, 'success');
}

// =========================================
// UTILITY FUNCTIONS
// =========================================

/**
 * Update lyrics statistics
 */
function updateLyricsStats() {
    const totalWordsElement = document.getElementById('totalWords');
    const totalLinesElement = document.getElementById('totalLines');
    const totalSectionsElement = document.getElementById('totalSections');
    const avgWordsPerLineElement = document.getElementById('avgWordsPerLine');
    
    if (!totalWordsElement) return;
    
    const sections = window.SongForge.lyricsEnhanced.sections;
    const totalWords = sections.reduce((sum, section) => sum + (section.wordCount || 0), 0);
    const totalLines = sections.reduce((sum, section) => sum + (section.lineCount || 0), 0);
    const avgWordsPerLine = totalLines > 0 ? (totalWords / totalLines).toFixed(1) : 0;
    
    totalWordsElement.textContent = totalWords;
    totalLinesElement.textContent = totalLines;
    totalSectionsElement.textContent = sections.length;
    avgWordsPerLineElement.textContent = avgWordsPerLine;
}

/**
 * Save lyrics to project
 */
function saveLyricsToProject() {
    if (window.SongForge.app.currentProject) {
        window.SongForge.app.currentProject.lyrics = window.SongForge.lyricsEnhanced.sections;
    }
}

/**
 * Load importable projects
 */
function loadImportableProjects() {
    const container = document.getElementById('importableProjects');
    if (!container) return;
    
    const projects = getProjectsForUser();
    const currentProjectId = window.SongForge.app.currentProject?.id;
    
    // Filter out current project
    const importableProjects = projects.filter(p => p.id !== currentProjectId && p.lyrics && p.lyrics.length > 0);
    
    if (importableProjects.length === 0) {
        container.innerHTML = '<p class="text-gray-500 text-sm">No projects with lyrics found</p>';
        return;
    }
    
    container.innerHTML = importableProjects.slice(0, 5).map(project => `
        <div class="p-2 bg-light-panel dark:bg-dark-panel rounded border border-gray-200 dark:border-gray-700 hover:border-primary transition-colors cursor-pointer"
             onclick="importLyricsFromProject('${project.id}')">
            <div class="font-medium text-sm">${project.title || 'Untitled Project'}</div>
            <div class="text-xs text-gray-500">${project.lyrics.length} sections</div>
        </div>
    `).join('');
}

/**
 * Import lyrics from project
 */
function importLyricsFromProject(projectId) {
    const projects = getProjectsForUser();
    const project = projects.find(p => p.id === projectId);
    
    if (!project || !project.lyrics) {
        showNotification('Project not found or has no lyrics', 'error');
        return;
    }
    
    showConfirmDialog(
        `Import ${project.lyrics.length} sections from "${project.title || 'Untitled Project'}"?`,
        () => {
            // Add imported sections with new IDs
            const importedSections = project.lyrics.map(section => ({
                ...section,
                id: generateId(),
                title: `${section.title} (Imported)`,
                order: window.SongForge.lyricsEnhanced.sections.length + section.order
            }));
            
            window.SongForge.lyricsEnhanced.sections.push(...importedSections);
            saveLyricsToProject();
            renderLyricsSections();
            markProjectModified();
            
            showNotification(`Imported ${importedSections.length} sections`, 'success');
        }
    );
}

// =========================================
// AI TOOLS (Placeholder implementations)
// =========================================

/**
 * Show AI lyrics assistant
 */
function showAILyricsAssistant() {
    showNotification('AI Lyrics Assistant feature coming soon!', 'info');
}

/**
 * Show synonym finder
 */
function showSynonymFinder() {
    showNotification('Synonym Finder feature coming soon!', 'info');
}

/**
 * Show word suggestor
 */
function showWordSuggestor() {
    const randomCategory = Object.keys(WORD_BANKS)[Math.floor(Math.random() * Object.keys(WORD_BANKS).length)];
    const randomWords = WORD_BANKS[randomCategory].slice(0, 5);
    
    const content = `
        <div class="space-y-4">
            <h3 class="text-lg font-semibold">Word Suggestions</h3>
            <p class="text-sm text-gray-600 dark:text-gray-400">Random words from "${randomCategory}" category:</p>
            <div class="flex flex-wrap gap-2">
                ${randomWords.map(word => `
                    <span class="px-3 py-1 bg-primary text-white rounded cursor-pointer hover:bg-primary-dark transition-colors"
                          onclick="insertRhymeWord('${word}')">${word}</span>
                `).join('')}
            </div>
            <button onclick="showWordSuggestor()" class="w-full bg-secondary hover:bg-secondary-dark text-white py-2 rounded transition-colors">
                Get New Suggestions
            </button>
        </div>
    `;
    
    showModal('Word Suggestions', content);
}

/**
 * Show syllable counter
 */
function showSyllableCounter() {
    const content = `
        <div class="space-y-4">
            <h3 class="text-lg font-semibold">Syllable Counter</h3>
            <div>
                <input type="text" id="syllableInput" placeholder="Enter word or phrase..." 
                       class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-base">
            </div>
            <div id="syllableResult" class="p-3 bg-light-bg dark:bg-dark-bg rounded-lg hidden">
                <!-- Results will appear here -->
            </div>
            <button onclick="countSyllables()" class="w-full bg-primary hover:bg-primary-dark text-white py-2 rounded transition-colors">
                Count Syllables
            </button>
        </div>
    `;
    
    showModal('Syllable Counter', content);
}

/**
 * Count syllables (basic implementation)
 */
function countSyllables() {
    const input = document.getElementById('syllableInput');
    const result = document.getElementById('syllableResult');
    
    if (!input || !result) return;
    
    const text = input.value.trim();
    if (!text) {
        showNotification('Please enter a word or phrase', 'error');
        return;
    }
    
    const words = text.split(/\s+/);
    let totalSyllables = 0;
    const wordResults = [];
    
    words.forEach(word => {
        const syllables = countWordSyllables(word);
        totalSyllables += syllables;
        wordResults.push({ word, syllables });
    });
    
    result.innerHTML = `
        <div class="space-y-2">
            <div class="font-medium">Total Syllables: ${totalSyllables}</div>
            <div class="text-sm space-y-1">
                ${wordResults.map(({ word, syllables }) => 
                    `<div class="flex justify-between">
                        <span>${word}</span>
                        <span>${syllables} syllable${syllables !== 1 ? 's' : ''}</span>
                    </div>`
                ).join('')}
            </div>
        </div>
    `;
    
    result.classList.remove('hidden');
}

/**
 * Count syllables in a word (basic implementation)
 */
function countWordSyllables(word) {
    // Remove non-alphabetic characters and convert to lowercase
    word = word.toLowerCase().replace(/[^a-z]/g, '');
    
    if (word.length === 0) return 0;
    if (word.length <= 3) return 1;
    
    // Count vowel groups
    const vowels = 'aeiouy';
    let syllableCount = 0;
    let previousWasVowel = false;
    
    for (let i = 0; i < word.length; i++) {
        const isVowel = vowels.includes(word[i]);
        
        if (isVowel && !previousWasVowel) {
            syllableCount++;
        }
        
        previousWasVowel = isVowel;
    }
    
    // Handle silent 'e'
    if (word.endsWith('e') && syllableCount > 1) {
        syllableCount--;
    }
    
    // Ensure at least 1 syllable
    return Math.max(1, syllableCount);
}

/**
 * Show import dialog
 */
function showImportDialog() {
    loadImportableProjects();
    showNotification('Import feature loaded in sidebar', 'info');
}

//
