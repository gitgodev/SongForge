// =========================================
// LYRICS MANAGEMENT FOR SONGFORGE
// =========================================

// Add this function at the top of js/lyrics.js
function ensureProjectExists() {
    if (!window.SongForge) {
        window.SongForge = {};
    }
    
    if (!window.SongForge.currentProject) {
        window.SongForge.currentProject = {
            id: Date.now().toString(36),
            lyrics: [],
            workflow: [],
            release: [],
            recordings: [],
            title: '',
            artist: '',
            genre: '',
            bpm: '',
            key: '',
            notes: '',
            beatFile: null,
            artwork: null,
            releaseDate: '',
            createdDate: new Date().toLocaleDateString(),
            modifiedDate: new Date().toLocaleDateString(),
            version: '1.0'
        };
    }
    
    if (!window.SongForge.currentProject.lyrics) {
        window.SongForge.currentProject.lyrics = [];
    }
    
    if (!window.SongForge.lyrics) {
        window.SongForge.lyrics = {
            sections: [],
            currentSection: null,
            aiAssistantActive: false,
            draggedSection: null,
            autoSave: true,
            wordCount: 0,
            rhymeCache: new Map(),
            synonymCache: new Map()
        };
    }
}

// Update the renderLyricsSections function
function renderLyricsSections() {
    ensureProjectExists(); // Add this line
    
    const container = document.getElementById('lyricsSections');
    if (!container) return;
    
    // Rest of your existing code...
}

// Update other functions that access currentProject.lyrics
function loadDefaultLyricsSections() {
    ensureProjectExists(); // Add this line
}


// Lyrics system state
window.SongForge.lyrics = {
    sections: [],
    currentSection: null,
    aiAssistantActive: false,
    draggedSection: null,
    autoSave: true,
    wordCount: 0,
    rhymeCache: new Map(),
    synonymCache: new Map()
};

// Default section types and their properties
const SECTION_TYPES = {
    verse: { 
        name: 'Verse', 
        color: 'blue', 
        icon: 'align-left',
        defaultTitle: 'Verse'
    },
    chorus: { 
        name: 'Chorus', 
        color: 'red', 
        icon: 'repeat',
        defaultTitle: 'Chorus'
    },
    bridge: { 
        name: 'Bridge', 
        color: 'green', 
        icon: 'bridge',
        defaultTitle: 'Bridge'
    },
    intro: { 
        name: 'Intro', 
        color: 'purple', 
        icon: 'play',
        defaultTitle: 'Intro'
    },
    outro: { 
        name: 'Outro', 
        color: 'yellow', 
        icon: 'stop',
        defaultTitle: 'Outro'
    },
    hook: { 
        name: 'Hook', 
        color: 'pink', 
        icon: 'anchor',
        defaultTitle: 'Hook'
    },
    prechorus: { 
        name: 'Pre-Chorus', 
        color: 'indigo', 
        icon: 'arrow-up',
        defaultTitle: 'Pre-Chorus'
    },
    interlude: { 
        name: 'Interlude', 
        color: 'gray', 
        icon: 'pause',
        defaultTitle: 'Interlude'
    }
};

// =========================================
// LYRICS INITIALIZATION
// =========================================

/**
 * Initialize lyrics system
 */
function initializeLyrics() {
    setupLyricsEventListeners();
    setupDragAndDropLyrics();
    setupAIHandlers();
    
    // Load default sections if none exist
    if (window.SongForge.currentProject.lyrics.length === 0) {
        loadDefaultLyricsSections();
    }
    
    renderLyricsSections();
    console.log('Lyrics system initialized');
}

/**
 * Load default lyrics sections
 */
function loadDefaultLyricsSections() {
    const defaultSections = [
        { type: 'intro', title: 'Intro', content: '' },
        { type: 'verse', title: 'Verse 1', content: '' },
        { type: 'chorus', title: 'Chorus', content: '' },
        { type: 'verse', title: 'Verse 2', content: '' },
        { type: 'chorus', title: 'Chorus', content: '' },
        { type: 'bridge', title: 'Bridge', content: '' },
        { type: 'chorus', title: 'Chorus', content: '' },
        { type: 'outro', title: 'Outro', content: '' }
    ];
    
    window.SongForge.currentProject.lyrics = defaultSections.map((section, index) => ({
        id: generateId(),
        ...section,
        order: index,
        wordCount: 0,
        lineCount: 0,
        notes: '',
        timestamp: new Date()
    }));
    
    window.SongForge.lyrics.sections = window.SongForge.currentProject.lyrics;
}

// =========================================
// LYRICS RENDERING
// =========================================

/**
 * Render all lyrics sections
 */
function renderLyricsSections() {
    const container = document.getElementById('lyricsSections');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Sort sections by order
    const sortedSections = [...window.SongForge.lyrics.sections].sort((a, b) => a.order - b.order);
    
    sortedSections.forEach(section => {
        const sectionElement = createLyricsSectionElement(section);
        container.appendChild(sectionElement);
    });
    
    // Update word count
    updateLyricsStats();
    
    // Recreate icons
    lucide.createIcons();
}

/**
 * Create a lyrics section element
 */
function createLyricsSectionElement(section) {
    const sectionType = SECTION_TYPES[section.type] || SECTION_TYPES.verse;
    
    const element = document.createElement('div');
    element.className = 'lyrics-section bg-white dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600 hover:border-primary transition-all duration-200';
    element.dataset.sectionId = section.id;
    element.draggable = true;
    
    element.innerHTML = `
        <div class="lyrics-section-header flex items-center justify-between mb-3">
            <div class="flex items-center space-x-3">
                <div class="drag-handle cursor-move p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <i data-lucide="grip-vertical" class="w-4 h-4"></i>
                </div>
                <input type="text" 
                       value="${section.title}" 
                       class="section-title font-medium bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-primary rounded px-2 py-1 text-base"
                       onchange="updateSectionTitle('${section.id}', this.value)"
                       placeholder="Section title">
                <span class="section-type-badge badge-${section.type} text-xs font-medium px-2 py-1 rounded-full">
                    ${sectionType.name}
                </span>
            </div>
            <div class="flex items-center space-x-2">
                <button onclick="duplicateSection('${section.id}')" 
                        class="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                        title="Duplicate section">
                    <i data-lucide="copy" class="w-4 h-4"></i>
                </button>
                <button onclick="showSectionOptions('${section.id}')" 
                        class="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                        title="Section options">
                    <i data-lucide="more-vertical" class="w-4 h-4"></i>
                </button>
                <button onclick="deleteSection('${section.id}')" 
                        class="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete section">
                    <i data-lucide="trash-2" class="w-4 h-4"></i>
                </button>
            </div>
        </div>
        
        <div class="lyrics-section-content">
            <textarea 
                placeholder="Write your lyrics here..." 
                class="lyrics-textarea w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-800 resize-none text-base leading-relaxed custom-scrollbar"
                onchange="updateSectionContent('${section.id}', this.value)"
                oninput="updateSectionStats('${section.id}', this.value)"
                data-section-id="${section.id}">${section.content}</textarea>
        </div>
        
        <div class="lyrics-section-footer flex items-center justify-between mt-2 text-xs text-gray-500">
            <div class="section-stats">
                <span id="words-${section.id}">${section.wordCount || 0} words</span> • 
                <span id="lines-${section.id}">${section.lineCount || 0} lines</span>
            </div>
            <div class="section-actions flex space-x-2">
                <button onclick="showRhymeHelper('${section.id}')" 
                        class="text-primary hover:text-primary-dark transition-colors"
                        title="Find rhymes">
                    <i data-lucide="music" class="w-3 h-3"></i>
                </button>
                <button onclick="showAIAssist('${section.id}')" 
                        class="text-primary hover:text-primary-dark transition-colors"
                        title="AI assistance">
                    <i data-lucide="sparkles" class="w-3 h-3"></i>
                </button>
            </div>
        </div>
    `;
    
    return element;
}

/**
 * Update lyrics statistics
 */
function updateLyricsStats() {
    let totalWords = 0;
    let totalLines = 0;
    
    window.SongForge.lyrics.sections.forEach(section => {
        totalWords += section.wordCount || 0;
        totalLines += section.lineCount || 0;
    });
    
    window.SongForge.lyrics.wordCount = totalWords;
    
    // Update UI if stats container exists
    const statsContainer = document.getElementById('lyricsStats');
    if (statsContainer) {
        statsContainer.innerHTML = `
            <div class="text-sm text-gray-600 dark:text-gray-400">
                <span class="font-medium">${totalWords}</span> words • 
                <span class="font-medium">${totalLines}</span> lines • 
                <span class="font-medium">${window.SongForge.lyrics.sections.length}</span> sections
            </div>
        `;
    }
}

// =========================================
// SECTION MANAGEMENT
// =========================================

/**
 * Add new section
 */
function addSection(type = 'verse', title = '', insertAfter = null) {
    const sectionType = SECTION_TYPES[type] || SECTION_TYPES.verse;
    const sectionNumber = window.SongForge.lyrics.sections.filter(s => s.type === type).length + 1;
    
    const newSection = {
        id: generateId(),
        type: type,
        title: title || `${sectionType.defaultTitle} ${sectionNumber}`,
        content: '',
        order: insertAfter ? insertAfter.order + 1 : window.SongForge.lyrics.sections.length,
        wordCount: 0,
        lineCount: 0,
        notes: '',
        timestamp: new Date()
    };
    
    // Insert section
    if (insertAfter) {
        // Reorder existing sections
        window.SongForge.lyrics.sections.forEach(section => {
            if (section.order > insertAfter.order) {
                section.order++;
            }
        });
    }
    
    window.SongForge.lyrics.sections.push(newSection);
    window.SongForge.currentProject.lyrics = window.SongForge.lyrics.sections;
    
    renderLyricsSections();
    
    // Focus on the new section
    setTimeout(() => {
        const textarea = document.querySelector(`[data-section-id="${newSection.id}"]`);
        if (textarea) textarea.focus();
    }, 100);
    
    showNotification(`${sectionType.name} section added`, 'success');
    
    return newSection;
}

/**
 * Delete section
 */
function deleteSection(sectionId) {
    const section = window.SongForge.lyrics.sections.find(s => s.id === sectionId);
    if (!section) return;
    
    showConfirmDialog(`Are you sure you want to delete "${section.title}"?`, () => {
        // Remove section
        window.SongForge.lyrics.sections = window.SongForge.lyrics.sections.filter(s => s.id !== sectionId);
        window.SongForge.currentProject.lyrics = window.SongForge.lyrics.sections;
        
        // Reorder remaining sections
        window.SongForge.lyrics.sections
            .sort((a, b) => a.order - b.order)
            .forEach((section, index) => {
                section.order = index;
            });
        
        renderLyricsSections();
        showNotification('Section deleted', 'info');
    });
}

/**
 * Duplicate section
 */
function duplicateSection(sectionId) {
    const section = window.SongForge.lyrics.sections.find(s => s.id === sectionId);
    if (!section) return;
    
    const duplicatedSection = {
        ...deepClone(section),
        id: generateId(),
        title: `${section.title} (Copy)`,
        order: section.order + 1,
        timestamp: new Date()
    };
    
    // Reorder existing sections
    window.SongForge.lyrics.sections.forEach(s => {
        if (s.order > section.order) {
            s.order++;
        }
    });
    
    window.SongForge.lyrics.sections.push(duplicatedSection);
    window.SongForge.currentProject.lyrics = window.SongForge.lyrics.sections;
    
    renderLyricsSections();
    showNotification('Section duplicated', 'success');
}

/**
 * Update section title
 */
function updateSectionTitle(sectionId, title) {
    const section = window.SongForge.lyrics.sections.find(s => s.id === sectionId);
    if (section && title.trim()) {
        section.title = title.trim();
        
        if (window.SongForge.lyrics.autoSave) {
            autoSaveLyrics();
        }
    }
}

/**
 * Update section content
 */
function updateSectionContent(sectionId, content) {
    const section = window.SongForge.lyrics.sections.find(s => s.id === sectionId);
    if (section) {
        section.content = content;
        updateSectionStats(sectionId, content);
        
        if (window.SongForge.lyrics.autoSave) {
            autoSaveLyrics();
        }
    }
}

/**
 * Update section statistics
 */
function updateSectionStats(sectionId, content) {
    const section = window.SongForge.lyrics.sections.find(s => s.id === sectionId);
    if (!section) return;
    
    const words = content.trim() ? content.trim().split(/\s+/).length : 0;
    const lines = content.split('\n').filter(line => line.trim()).length;
    
    section.wordCount = words;
    section.lineCount = lines;
    
    // Update UI
    const wordsSpan = document.getElementById(`words-${sectionId}`);
    const linesSpan = document.getElementById(`lines-${sectionId}`);
    
    if (wordsSpan) wordsSpan.textContent = `${words} words`;
    if (linesSpan) linesSpan.textContent = `${lines} lines`;
    
    // Throttled update of overall stats
    const debouncedUpdate = debounce(updateLyricsStats, 500);
    debouncedUpdate();
}

/**
 * Show section options menu
 */
function showSectionOptions(sectionId) {
    const section = window.SongForge.lyrics.sections.find(s => s.id === sectionId);
    if (!section) return;
    
    const sectionTypes = Object.entries(SECTION_TYPES).map(([key, type]) => 
        `<option value="${key}" ${section.type === key ? 'selected' : ''}>${type.name}</option>`
    ).join('');
    
    const content = `
        <div class="space-y-4">
            <div>
                <label class="block text-sm font-medium mb-1">Section Type</label>
                <select id="sectionTypeSelect" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-base">
                    ${sectionTypes}
                </select>
            </div>
            
            <div>
                <label class="block text-sm font-medium mb-1">Section Notes</label>
                <textarea id="sectionNotes" placeholder="Add notes about this section..." 
                         class="w-full h-20 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 resize-none text-base">${section.notes || ''}</textarea>
            </div>
            
            <div class="text-xs text-gray-500">
                Created: ${formatDate(new Date(section.timestamp), 'datetime')}
            </div>
            
            <div class="flex space-x-3">
                <button onclick="updateSectionOptions('${sectionId}')" 
                        class="flex-1 bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-lg transition-colors">
                    Save Changes
                </button>
                <button onclick="closeModal()" 
                        class="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors">
                    Cancel
                </button>
            </div>
        </div>
    `;
    
    showModal(`${section.title} Options`, content);
}

/**
 * Update section options
 */
function updateSectionOptions(sectionId) {
    const section = window.SongForge.lyrics.sections.find(s => s.id === sectionId);
    if (!section) return;
    
    const typeSelect = document.getElementById('sectionTypeSelect');
    const notesTextarea = document.getElementById('sectionNotes');
    
    if (typeSelect && notesTextarea) {
        section.type = typeSelect.value;
        section.notes = notesTextarea.value;
        
        renderLyricsSections();
        closeModal();
        showNotification('Section updated', 'success');
    }
}

// =========================================
// DRAG AND DROP
// =========================================

/**
 * Setup drag and drop for lyrics sections
 */
function setupDragAndDropLyrics() {
    const container = document.getElementById('lyricsSections');
    if (!container) return;
    
    container.addEventListener('dragstart', handleDragStart);
    container.addEventListener('dragover', handleDragOver);
    container.addEventListener('drop', handleDrop);
    container.addEventListener('dragend', handleDragEnd);
}

/**
 * Handle drag start
 */
function handleDragStart(e) {
    const sectionElement = e.target.closest('.lyrics-section');
    if (!sectionElement) return;
    
    window.SongForge.lyrics.draggedSection = sectionElement.dataset.sectionId;
    sectionElement.classList.add('dragging', 'opacity-50');
    
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', sectionElement.outerHTML);
}

/**
 * Handle drag over
 */
function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const afterElement = getDragAfterElement(e.clientY);
    const draggedElement = document.querySelector('.dragging');
    
    if (afterElement == null) {
        e.currentTarget.appendChild(draggedElement);
    } else {
        e.currentTarget.insertBefore(draggedElement, afterElement);
    }
}

/**
 * Handle drop
 */
function handleDrop(e) {
    e.preventDefault();
    
    const draggedSectionId = window.SongForge.lyrics.draggedSection;
    if (!draggedSectionId) return;
    
    // Reorder sections based on new DOM order
    const sectionElements = Array.from(document.querySelectorAll('.lyrics-section'));
    
    sectionElements.forEach((element, index) => {
        const sectionId = element.dataset.sectionId;
        const section = window.SongForge.lyrics.sections.find(s => s.id === sectionId);
        if (section) {
            section.order = index;
        }
    });
    
    // Update project data
    window.SongForge.currentProject.lyrics = window.SongForge.lyrics.sections;
    
    showNotification('Sections reordered', 'success');
}

/**
 * Handle drag end
 */
function handleDragEnd(e) {
    const draggedElement = document.querySelector('.dragging');
    if (draggedElement) {
        draggedElement.classList.remove('dragging', 'opacity-50');
    }
    
    window.SongForge.lyrics.draggedSection = null;
}

/**
 * Get the element after which to insert the dragged element
 */
function getDragAfterElement(y) {
    const draggableElements = [...document.querySelectorAll('.lyrics-section:not(.dragging)')];
    
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// =========================================
// AI ASSISTANCE
// =========================================

/**
 * Setup AI handlers for lyrics assistance
 */
function setupAIHandlers() {
    // Register Poe handlers for lyrics AI features
    if (window.Poe && window.Poe.registerHandler) {
        window.Poe.registerHandler('lyrics-ai-assist', handleAIAssistResponse);
        window.Poe.registerHandler('lyrics-rhyme-finder', handleRhymeFinderResponse);
        window.Poe.registerHandler('lyrics-synonym-finder', handleSynonymFinderResponse);
        window.Poe.registerHandler('lyrics-idea-generator', handleIdeaGeneratorResponse);
    }
}

/**
 * Show AI assistance for a section
 */
function showAIAssist(sectionId) {
    const section = window.SongForge.lyrics.sections.find(s => s.id === sectionId);
    if (!section) return;
    
    const content = `
        <div class="space-y-4">
            <div>
                <label class="block text-sm font-medium mb-1">What do you need help with?</label>
                <textarea id="aiPrompt" placeholder="e.g., Write a verse about overcoming challenges, or improve these lyrics..." 
                         class="w-full h-24 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 resize-none text-base"></textarea>
            </div>
            
            ${section.content ? `
            <div>
                <label class="block text-sm font-medium mb-1">Current Lyrics:</label>
                <div class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm max-h-32 overflow-y-auto custom-scrollbar">
                    ${section.content.replace(/\n/g, '<br>')}
                </div>
            </div>
            ` : ''}
            
            <div class="flex space-x-3">
                <button onclick="requestAIAssist('${sectionId}')" 
                        class="flex-1 bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-lg transition-colors">
                    <i data-lucide="sparkles" class="w-4 h-4 mr-2 inline"></i>
                    Get AI Help
                </button>
                <button onclick="closeModal()" 
                        class="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors">
                    Cancel
                </button>
            </div>
            
            <div id="aiResponse" class="hidden">
                <label class="block text-sm font-medium mb-1">AI Response:</label>
                <div id="aiContent" class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm max-h-48 overflow-y-auto custom-scrollbar"></div>
                <div class="mt-3 flex space-x-2">
                    <button onclick="applyAIResponse('${sectionId}')" 
                            class="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors">
                        Apply to Section
                    </button>
                    <button onclick="copyAIResponse()" 
                            class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors">
                        Copy to Clipboard
                    </button>
                </div>
            </div>
        </div>
    `;
    
    showModal(`AI Assistant - ${section.title}`, content);
}

/**
 * Request AI assistance
 */
async function requestAIAssist(sectionId) {
    const section = window.SongForge.lyrics.sections.find(s => s.id === sectionId);
    const promptTextarea = document.getElementById('aiPrompt');
    
    if (!section || !promptTextarea || !promptTextarea.value.trim()) {
        showNotification('Please enter a request for the AI assistant', 'error');
        return;
    }
    
    const prompt = promptTextarea.value.trim();
    const responseDiv = document.getElementById('aiResponse');
    const contentDiv = document.getElementById('aiContent');
    
    responseDiv.classList.remove('hidden');
    contentDiv.innerHTML = '<div class="flex items-center"><div class="spinner mr-3"></div>Generating response...</div>';
    
    try {
        let aiPrompt = `You are a professional songwriter and lyricist. Help with this request: ${prompt}`;
        
        if (section.content) {
            aiPrompt += `\n\nCurrent lyrics for this section:\n${section.content}`;
        }
        
        aiPrompt += '\n\nProvide creative, professional lyrics that match the request. Focus on the specific section type and maintain good flow and rhythm.';
        
        await window.Poe.sendUserMessage(`@Claude-Sonnet-4 ${aiPrompt}`, {
            handler: 'lyrics-ai-assist',
            stream: true,
            openChat: false,
            handlerContext: { sectionId: sectionId }
        });
        
    } catch (error) {
        contentDiv.textContent = 'Error generating response. Please try again.';
        handleError(error, 'AI assistance request');
    }
}

/**
 * Handle AI assistance response
 */
function handleAIAssistResponse(result, context) {
    const contentDiv = document.getElementById('aiContent');
    if (!contentDiv) return;
    
    const msg = result.responses[0];
    if (msg.status === 'error') {
        contentDiv.textContent = 'Error: ' + msg.statusText;
    } else if (msg.status === 'incomplete') {
        contentDiv.textContent = msg.content;
    } else if (msg.status === 'complete') {
        contentDiv.textContent = msg.content;
        
        // Store response for later use
        window.SongForge.lyrics.lastAIResponse = msg.content;
    }
}

/**
 * Apply AI response to section
 */
function applyAIResponse(sectionId) {
    const section = window.SongForge.lyrics.sections.find(s => s.id === sectionId);
    const response = window.SongForge.lyrics.lastAIResponse;
    
    if (!section || !response) return;
    
    section.content = response;
    updateSectionStats(sectionId, response);
    
    // Update textarea if visible
    const textarea = document.querySelector(`[data-section-id="${sectionId}"]`);
    if (textarea) {
        textarea.value = response;
    }
    
    closeModal();
    showNotification('AI response applied to section', 'success');
}

/**
 * Copy AI response to clipboard
 */
function copyAIResponse() {
    const response = window.SongForge.lyrics.lastAIResponse;
    if (!response) return;
    
    navigator.clipboard.writeText(response).then(() => {
        showNotification('Response copied to clipboard', 'success');
    }).catch(() => {
        showNotification('Failed to copy to clipboard', 'error');
    });
}

// =========================================
// RHYME HELPER
// =========================================

/**
 * Show rhyme helper
 */
function showRhymeHelper(sectionId) {
    const content = `
        <div class="space-y-4">
            <div>
                <label class="block text-sm font-medium mb-1">Word to find rhymes for:</label>
                <input type="text" id="rhymeWord" placeholder="e.g., love, heart, dream..." 
                       class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-base">
            </div>
            
            <div class="flex space-x-3">
                <button onclick="findRhymes('${sectionId}')" 
                        class="flex-1 bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-lg transition-colors">
                    <i data-lucide="music" class="w-4 h-4 mr-2 inline"></i>
                    Find Rhymes
                </button>
                <button onclick="closeModal()" 
                        class="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors">
                    Close
                </button>
            </div>
            
            <div id="rhymeResults" class="hidden">
                <label class="block text-sm font-medium mb-1">Rhyming Words:</label>
                <div id="rhymeList" class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm max-h-48 overflow-y-auto custom-scrollbar"></div>
            </div>
        </div>
    `;
    
    showModal('Find Rhymes', content);
}

/**
 * Find rhymes for a word
 */
async function findRhymes(sectionId) {
    const wordInput = document.getElementById('rhymeWord');
    if (!wordInput || !wordInput.value.trim()) {
        showNotification('Please enter a word to find rhymes for', 'error');
        return;
    }
    
    const word = wordInput.value.trim().toLowerCase();
    const resultsDiv = document.getElementById('rhymeResults');
    const listDiv = document.getElementById('rhymeList');
    
    // Check cache first
    if (window.SongForge.lyrics.rhymeCache.has(word)) {
        displayRhymes(window.SongForge.lyrics.rhymeCache.get(word));
        return;
    }
    
    resultsDiv.classList.remove('hidden');
    listDiv.innerHTML = '<div class="flex items-center"><div class="spinner mr-3"></div>Finding rhymes...</div>';
    
    try {
        await window.Poe.sendUserMessage(`@Claude-Sonnet-4 Find words that rhyme with "${word}". Provide ONLY a comma-separated list of rhyming words, no explanations or additional text.`, {
            handler: 'lyrics-rhyme-finder',
            stream: false,
            openChat: false,
            handlerContext: { word: word }
        });
        
    } catch (error) {
        listDiv.textContent = 'Error finding rhymes. Please try again.';
        handleError(error, 'Rhyme finder');
    }
}

/**
 * Handle rhyme finder response
 */
function handleRhymeFinderResponse(result, context) {
    const listDiv = document.getElementById('rhymeList');
    if (!listDiv) return;
    
    const msg = result.responses[0];
    if (msg.status === 'error') {
        listDiv.textContent = 'Error: ' + msg.statusText;
    } else if (msg.status === 'complete') {
        const rhymes = msg.content.split(',').map(word => word.trim()).filter(word => word);
        
        // Cache the results
        window.SongForge.lyrics.rhymeCache.set(context.word, rhymes);
        
        displayRhymes(rhymes);
    }
}

/**
 * Display rhymes in the UI
 */
function displayRhymes(rhymes) {
    const listDiv = document.getElementById('rhymeList');
    if (!listDiv) return;
    
    if (rhymes.length === 0) {
        listDiv.textContent = 'No rhymes found.';
        return;
    }
    
    listDiv.innerHTML = rhymes.map(word => 
        `<span class="inline-block bg-primary text-white px-2 py-1 rounded text-xs mr-2 mb-2 cursor-pointer hover:bg-primary-dark transition-colors" onclick="insertWordAtCursor('${word}')">${word}</span>`
    ).join('');
}

/**
 * Insert word at cursor position
 */
function insertWordAtCursor(word) {
    // Find the currently focused textarea
    const activeTextarea = document.activeElement;
    
    if (activeTextarea && activeTextarea.tagName === 'TEXTAREA' && activeTextarea.classList.contains('lyrics-textarea')) {
        const start = activeTextarea.selectionStart;
        const end = activeTextarea.selectionEnd;
        const text = activeTextarea.value;
        
        const newText = text.substring(0, start) + word + text.substring(end);
        activeTextarea.value = newText;
        
        // Update the section content
        const sectionId = activeTextarea.dataset.sectionId;
        if (sectionId) {
            updateSectionContent(sectionId, newText);
        }
        
        // Set cursor position after the inserted word
        activeTextarea.focus();
        activeTextarea.setSelectionRange(start + word.length, start + word.length);
        
        showNotification(`"${word}" inserted`, 'success', 1000);
    } else {
        // Copy to clipboard as fallback
        navigator.clipboard.writeText(word).then(() => {
            showNotification(`"${word}" copied to clipboard`, 'info');
        });
    }
}

// =========================================
// LYRICS EXPORT
// =========================================

/**
 * Export lyrics as text
 */
function exportLyricsAsText() {
    const project = window.SongForge.currentProject;
    let content = '';
    
    // Header
    content += `${project.title || 'Untitled'}\n`;
    if (project.artist) content += `Artist: ${project.artist}\n`;
    if (project.genre) content += `Genre: ${project.genre}\n`;
    if (project.bpm) content += `BPM: ${project.bpm}\n`;
    if (project.key) content += `Key: ${project.key}\n`;
    content += `\n`;
    
    // Sections
    const sortedSections = [...window.SongForge.lyrics.sections]
        .sort((a, b) => a.order - b.order)
        .filter(section => section.content.trim());
    
    sortedSections.forEach(section => {
        content += `[${section.title}]\n`;
        content += `${section.content}\n\n`;
    });
    
    // Footer
    content += `\n---\n`;
    content += `Created with SongForge\n`;
    content += `Export Date: ${formatDate(new Date(), 'datetime')}\n`;
    
    downloadFile(content, `${project.title || 'lyrics'}.txt`, 'text/plain');
    showNotification('Lyrics exported as text', 'success');
}

/**
 * Export lyrics as Markdown
 */
function exportLyricsAsMarkdown() {
    const project = window.SongForge.currentProject;
    let content = '';
    
    // Header
    content += `# ${project.title || 'Untitled'}\n\n`;
    
    if (project.artist || project.genre || project.bpm || project.key) {
        content += `**Project Details:**\n`;
        if (project.artist) content += `- **Artist:** ${project.artist}\n`;
        if (project.genre) content += `- **Genre:** ${project.genre}\n`;
        if (project.bpm) content += `- **BPM:** ${project.bpm}\n`;
        if (project.key) content += `- **Key:** ${project.key}\n`;
        content += `\n`;
    }
    
    // Sections
    const sortedSections = [...window.SongForge.lyrics.sections]
        .sort((a, b) => a.order - b.order)
        .filter(section => section.content.trim());
    
    sortedSections.forEach(section => {
        content += `## ${section.title}\n\n`;
        content += `${section.content}\n\n`;
    });
    
    // Footer
    content += `---\n\n`;
    content += `*Created with SongForge*  \n`;
    content += `*Export Date: ${formatDate(new Date(), 'datetime')}*\n`;
    
    downloadFile(content, `${project.title || 'lyrics'}.md`, 'text/markdown');
    showNotification('Lyrics exported as Markdown', 'success');
}

// =========================================
// AUTO-SAVE
// =========================================

/**
 * Auto-save lyrics to local storage
 */
function autoSaveLyrics() {
    if (window.SongForge.lyrics.autoSave) {
        saveToStorage('current-project', window.SongForge.currentProject);
    }
}

// =========================================
// EVENT LISTENERS
// =========================================

/**
 * Setup lyrics event listeners
 */
function setupLyricsEventListeners() {
    // Add section button
    const addSectionBtn = document.getElementById('addSectionBtn');
    if (addSectionBtn) {
        addSectionBtn.addEventListener('click', showAddSectionDialog);
    }
    
    // AI assist button
    const aiAssistBtn = document.getElementById('aiAssistBtn');
    if (aiAssistBtn) {
        aiAssistBtn.addEventListener('click', () => showGeneralAIAssist());
    }
    
    // Rhyme button
    const rhymeBtn = document.getElementById('rhymeBtn');
    if (rhymeBtn) {
        rhymeBtn.addEventListener('click', () => showRhymeHelper(null));
    }
    
    // Export buttons
    const exportTxtBtn = document.getElementById('exportTxtBtn');
    const exportMdBtn = document.getElementById('exportMdBtn');
    
    if (exportTxtBtn) exportTxtBtn.addEventListener('click', exportLyricsAsText);
    if (exportMdBtn) exportMdBtn.addEventListener('click', exportLyricsAsMarkdown);
    
    // Keyboard shortcuts for lyrics tab
    document.addEventListener('keydown', (e) => {
        // Only apply shortcuts when in lyrics tab
        const lyricsTab = document.getElementById('lyricsTab');
        if (!lyricsTab || lyricsTab.classList.contains('hidden')) return;
        
        // Ctrl/Cmd + Enter - Add new section after current
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            showAddSectionDialog();
        }
        
        // Ctrl/Cmd + D - Duplicate current section
        if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
            e.preventDefault();
            const activeTextarea = document.activeElement;
            if (activeTextarea && activeTextarea.dataset.sectionId) {
                duplicateSection(activeTextarea.dataset.sectionId);
            }
        }
    });
}

/**
 * Show add section dialog
 */
function showAddSectionDialog() {
    const sectionTypes = Object.entries(SECTION_TYPES).map(([key, type]) => 
        `<option value="${key}">${type.name}</option>`
    ).join('');
    
    const content = `
        <div class="space-y-4">
            <div>
                <label class="block text-sm font-medium mb-1">Section Type</label>
                <select id="newSectionType" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-base">
                    ${sectionTypes}
                </select>
            </div>
            
            <div>
                <label class="block text-sm font-medium mb-1">Section Title</label>
                <input type="text" id="newSectionTitle" placeholder="e.g., Verse 3, Chorus, Bridge..." 
                       class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-base">
            </div>
            
            <div class="flex space-x-3">
                <button onclick="createNewSection()" 
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
    
    showModal('Add New Section', content);
}

/**
 * Create new section from dialog
 */
function createNewSection() {
    const typeSelect = document.getElementById('newSectionType');
    const titleInput = document.getElementById('newSectionTitle');
    
    if (typeSelect && titleInput) {
        const type = typeSelect.value;
        const title = titleInput.value.trim();
        
        addSection(type, title);
        closeModal();
    }
}

/**
 * Show general AI assist (not tied to specific section)
 */
function showGeneralAIAssist() {
    const content = `
        <div class="space-y-4">
            <div>
                <label class="block text-sm font-medium mb-1">What do you need help with?</label>
                <textarea id="generalAiPrompt" placeholder="e.g., Give me ideas for a song about friendship, help me write a catchy chorus..." 
                         class="w-full h-24 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 resize-none text-base"></textarea>
            </div>
            
            <div class="flex space-x-3">
                <button onclick="requestGeneralAIHelp()" 
                        class="flex-1 bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-lg transition-colors">
                    <i data-lucide="sparkles" class="w-4 h-4 mr-2 inline"></i>
                    Get AI Help
                </button>
                <button onclick="closeModal()" 
                        class="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors">
                    Cancel
                </button>
            </div>
            
            <div id="generalAiResponse" class="hidden">
                <label class="block text-sm font-medium mb-1">AI Response:</label>
                <div id="generalAiContent" class="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm max-h-48 overflow-y-auto custom-scrollbar whitespace-pre-wrap"></div>
                <div class="mt-3">
                    <button onclick="copyGeneralAIResponse()" 
                            class="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm transition-colors">
                        Copy to Clipboard
                    </button>
                </div>
            </div>
        </div>
    `;
    
    showModal('AI Assistant', content);
}

/**
 * Request general AI help
 */
async function requestGeneralAIHelp() {
    const promptTextarea = document.getElementById('generalAiPrompt');
    
    if (!promptTextarea || !promptTextarea.value.trim()) {
        showNotification('Please enter a request for the AI assistant', 'error');
        return;
    }
    
    const prompt = promptTextarea.value.trim();
    const responseDiv = document.getElementById('generalAiResponse');
    const contentDiv = document.getElementById('generalAiContent');
    
    responseDiv.classList.remove('hidden');
    contentDiv.innerHTML = '<div class="flex items-center"><div class="spinner mr-3"></div>Generating response...</div>';
    
    try {
        const aiPrompt = `You are a professional songwriter and lyricist. Help with this request: ${prompt}\n\nProvide creative, professional advice and suggestions for songwriting.`;
        
        await window.Poe.sendUserMessage(`@Claude-Sonnet-4 ${aiPrompt}`, {
            handler: 'lyrics-idea-generator',
            stream: true,
            openChat: false
        });
        
    } catch (error) {
        contentDiv.textContent = 'Error generating response. Please try again.';
        handleError(error, 'General AI assistance request');
    }
}

/**
 * Handle idea generator response
 */
function handleIdeaGeneratorResponse(result, context) {
    const contentDiv = document.getElementById('generalAiContent');
    if (!contentDiv) return;
    
    const msg = result.responses[0];
    if (msg.status === 'error') {
        contentDiv.textContent = 'Error: ' + msg.statusText;
    } else if (msg.status === 'incomplete') {
        contentDiv.textContent = msg.content;
    } else if (msg.status === 'complete') {
        contentDiv.textContent = msg.content;
        window.SongForge.lyrics.lastGeneralResponse = msg.content;
    }
}

/**
 * Copy general AI response to clipboard
 */
function copyGeneralAIResponse() {
    const response = window.SongForge.lyrics.lastGeneralResponse;
    if (!response) return;
    
    navigator.clipboard.writeText(response).then(() => {
        showNotification('Response copied to clipboard', 'success');
    }).catch(() => {
        showNotification('Failed to copy to clipboard', 'error');
    });
}

// =========================================
// INITIALIZATION
// =========================================

// Initialize lyrics system when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeLyrics);
} else {
    initializeLyrics();
}
