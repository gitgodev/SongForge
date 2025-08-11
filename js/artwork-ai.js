// =========================================
// AI ARTWORK GENERATION FOR SONGFORGE
// =========================================

// Artwork AI state
window.SongForge = window.SongForge || {};
window.SongForge.artworkAI = {
    currentArtwork: null,
    generationHistory: [],
    isGenerating: false,
    availableStyles: [
        'realistic', 'anime', 'digital-art', 'oil-painting', 'watercolor',
        'sketch', 'pop-art', 'abstract', 'minimalist', 'vintage'
    ],
    availableAspectRatios: [
        { label: '1:1 (Square)', value: '1:1' },
        { label: '4:3 (Standard)', value: '4:3' },
        { label: '16:9 (Widescreen)', value: '16:9' },
        { label: '3:2 (Photography)', value: '3:2' }
    ]
};

// Free AI image generation services (with API endpoints)
const AI_SERVICES = {
    huggingface: {
        name: 'Hugging Face',
        endpoint: 'https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5',
        requiresAuth: true,
        free: true
    },
    replicate: {
        name: 'Replicate',
        endpoint: 'https://api.replicate.com/v1/predictions',
        requiresAuth: true,
        free: false
    },
    local: {
        name: 'Client-Side Generation',
        endpoint: null,
        requiresAuth: false,
        free: true
    }
};

// =========================================
// ARTWORK CONTENT LOADING
// =========================================

/**
 * Load artwork AI content
 */
function loadArtworkAIContent() {
    const tabContent = document.getElementById('tabContent');
    if (!tabContent) return;
    
    tabContent.innerHTML = `
        <div class="grid lg:grid-cols-2 gap-6">
            <!-- AI Generation Panel -->
            <div class="bg-light-panel dark:bg-dark-panel rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                <h3 class="text-lg font-semibold mb-4">AI Artwork Generator</h3>
                
                <div class="space-y-4">
                    <!-- Prompt Input -->
                    <div>
                        <label class="block text-sm font-medium mb-2">Artwork Description</label>
                        <textarea id="artworkPrompt" placeholder="Describe your album artwork... e.g., 'Dark hip-hop album cover with neon lights, urban cityscape, moody atmosphere'" 
                                 class="w-full h-24 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-light-bg dark:bg-dark-bg resize-none text-base"></textarea>
                        <div class="mt-2 flex flex-wrap gap-2">
                            <button onclick="addPromptSuggestion('album cover')" class="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded hover:bg-primary hover:text-white transition-colors">album cover</button>
                            <button onclick="addPromptSuggestion('professional')" class="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded hover:bg-primary hover:text-white transition-colors">professional</button>
                            <button onclick="addPromptSuggestion('high quality')" class="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded hover:bg-primary hover:text-white transition-colors">high quality</button>
                            <button onclick="addPromptSuggestion('4K resolution')" class="text-xs bg-gray-200 dark:bg-gray-600 px-2 py-1 rounded hover:bg-primary hover:text-white transition-colors">4K resolution</button>
                        </div>
                    </div>
                    
                    <!-- Style Selection -->
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium mb-2">Art Style</label>
                            <select id="artworkStyle" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-light-bg dark:bg-dark-bg text-base">
                                <option value="">Auto (AI decides)</option>
                                <option value="realistic">Realistic</option>
                                <option value="anime">Anime/Manga</option>
                                <option value="digital-art">Digital Art</option>
                                <option value="oil-painting">Oil Painting</option>
                                <option value="watercolor">Watercolor</option>
                                <option value="sketch">Sketch/Drawing</option>
                                <option value="pop-art">Pop Art</option>
                                <option value="abstract">Abstract</option>
                                <option value="minimalist">Minimalist</option>
                                <option value="vintage">Vintage/Retro</option>
                            </select>
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium mb-2">Aspect Ratio</label>
                            <select id="aspectRatio" class="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-light-bg dark:bg-dark-bg text-base">
                                <option value="1:1">1:1 (Square - Recommended)</option>
                                <option value="4:3">4:3 (Standard)</option>
                                <option value="16:9">16:9 (Widescreen)</option>
                                <option value="3:2">3:2 (Photography)</option>
                            </select>
                        </div>
                    </div>
                    
                    <!-- Advanced Options -->
                    <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <button id="toggleAdvancedOptions" class="flex items-center text-sm text-primary hover:text-primary-dark transition-colors mb-3">
                            <i data-lucide="chevron-right" class="w-4 h-4 mr-1 transition-transform" id="advancedChevron"></i>
                            Advanced Options
                        </button>
                        
                        <div id="advancedOptions" class="hidden space-y-3">
                            <div>
                                <label class="block text-sm font-medium mb-2">Negative Prompt (what to avoid)</label>
                                <textarea id="negativePrompt" placeholder="e.g., blurry, low quality, text, watermark..." 
                                         class="w-full h-16 p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-light-bg dark:bg-dark-bg resize-none text-sm"></textarea>
                            </div>
                            
                            <div class="grid grid-cols-2 gap-3">
                                <div>
                                    <label class="block text-sm font-medium mb-1">Creativity Level</label>
                                    <input type="range" id="creativityLevel" min="1" max="10" value="7" 
                                           class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700">
                                    <div class="flex justify-between text-xs text-gray-500 mt-1">
                                        <span>Conservative</span>
                                        <span>Creative</span>
                                    </div>
                                </div>
                                
                                <div>
                                    <label class="block text-sm font-medium mb-1">Color Intensity</label>
                                    <input type="range" id="colorIntensity" min="1" max="10" value="6" 
                                           class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700">
                                    <div class="flex justify-between text-xs text-gray-500 mt-1">
                                        <span>Muted</span>
                                        <span>Vibrant</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Generation Button -->
                    <button id="generateArtworkBtn" class="w-full bg-primary hover:bg-primary-dark text-white py-3 px-4 rounded-lg transition-colors font-medium">
                        <i data-lucide="sparkles" class="w-5 h-5 mr-2 inline"></i>
                        Generate Artwork
                    </button>
                    
                    <!-- Generation Status -->
                    <div id="generationStatus" class="hidden">
                        <div class="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                            <span class="text-sm">Generating artwork... This may take 30-60 seconds</span>
                        </div>
                    </div>
                    
                    <!-- Quick Templates -->
                    <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <h4 class="text-sm font-medium mb-3">Quick Templates</h4>
                        <div class="grid grid-cols-2 gap-2">
                            <button onclick="loadTemplate('hiphop')" class="text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded hover:bg-primary hover:text-white transition-colors">Hip-Hop</button>
                            <button onclick="loadTemplate('rnb')" class="text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded hover:bg-primary hover:text-white transition-colors">R&B</button>
                            <button onclick="loadTemplate('pop')" class="text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded hover:bg-primary hover:text-white transition-colors">Pop</button>
                            <button onclick="loadTemplate('rock')" class="text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded hover:bg-primary hover:text-white transition-colors">Rock</button>
                            <button onclick="loadTemplate('electronic')" class="text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded hover:bg-primary hover:text-white transition-colors">Electronic</button>
                            <button onclick="loadTemplate('abstract')" class="text-xs bg-gray-100 dark:bg-gray-700 p-2 rounded hover:bg-primary hover:text-white transition-colors">Abstract</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Preview and Results -->
            <div class="space-y-6">
                <!-- Current Artwork Preview -->
                <div class="bg-light-panel dark:bg-dark-panel rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                    <h3 class="text-lg font-semibold mb-4">Artwork Preview</h3>
                    
                    <div id="artworkPreviewContainer" class="aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                        <div id="artworkPlaceholder" class="text-center text-gray-500">
                            <i data-lucide="image" class="w-16 h-16 mx-auto mb-3 opacity-50"></i>
                            <p>No artwork generated</p>
                            <p class="text-sm">Use the generator to create album art</p>
                        </div>
                        <img id="artworkPreview" class="hidden w-full h-full object-cover rounded-lg" alt="Generated artwork">
                    </div>
                    
                    <div id="artworkActions" class="hidden space-y-3">
                        <div class="flex space-x-3">
                            <button id="downloadArtwork" class="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-colors text-sm">
                                <i data-lucide="download" class="w-4 h-4 mr-2 inline"></i>
                                Download
                            </button>
                            <button id="saveArtwork" class="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors text-sm">
                                <i data-lucide="save" class="w-4 h-4 mr-2 inline"></i>
                                Save to Project
                            </button>
                        </div>
                        
                        <div class="flex space-x-3">
                            <button id="regenerateArtwork" class="flex-1 bg-secondary hover:bg-secondary-dark text-white py-2 px-4 rounded-lg transition-colors text-sm">
                                <i data-lucide="refresh-cw" class="w-4 h-4 mr-2 inline"></i>
                                Regenerate
                            </button>
                            <button id="variationsArtwork" class="flex-1 bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg transition-colors text-sm">
                                <i data-lucide="copy" class="w-4 h-4 mr-2 inline"></i>
                                Variations
                            </button>
                        </div>
                    </div>
                    
                    <!-- Manual Upload Option -->
                    <div class="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                        <h4 class="text-sm font-medium mb-2">Or Upload Your Own</h4>
                        <button id="uploadArtworkBtn" class="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors text-sm">
                            <i data-lucide="upload" class="w-4 h-4 mr-2 inline"></i>
                            Upload Image File
                        </button>
                        <input type="file" id="artworkUploadInput" accept="image/*" class="hidden">
                    </div>
                </div>
                
                <!-- Generation History -->
                <div class="bg-light-panel dark:bg-dark-panel rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-lg font-semibold">Generation History</h3>
                        <button id="clearHistory" class="text-sm text-red-500 hover:text-red-600">Clear All</button>
                    </div>
                    
                    <div id="generationHistory" class="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
                        <div class="text-center py-8 text-gray-500">
                            <i data-lucide="history" class="w-12 h-12 mx-auto mb-3 opacity-50"></i>
                            <p>No generations yet</p>
                            <p class="text-sm">Generated artworks will appear here</p>
                        </div>
                    </div>
                </div>
                
                <!-- Artwork Guidelines -->
                <div class="bg-light-panel dark:bg-dark-panel rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                    <h3 class="text-lg font-semibold mb-4">Industry Guidelines</h3>
                    <div class="space-y-2 text-sm">
                        <div class="flex items-start">
                            <i data-lucide="check" class="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0"></i>
                            <span>Minimum 3000x3000px for streaming platforms</span>
                        </div>
                        <div class="flex items-start">
                            <i data-lucide="check" class="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0"></i>
                            <span>Square aspect ratio (1:1) preferred</span>
                        </div>
                        <div class="flex items-start">
                            <i data-lucide="check" class="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0"></i>
                            <span>RGB color mode for digital distribution</span>
                        </div>
                        <div class="flex items-start">
                            <i data-lucide="check" class="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0"></i>
                            <span>Avoid small text (may not be readable)</span>
                        </div>
                        <div class="flex items-start">
                            <i data-lucide="check" class="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0"></i>
                            <span>High contrast for thumbnail visibility</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Initialize artwork AI
    initializeArtworkAI();
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// =========================================
// ARTWORK AI INITIALIZATION
// =========================================

/**
 * Initialize artwork AI system
 */
function initializeArtworkAI() {
    setupArtworkEventListeners();
    loadArtworkData();
    loadGenerationHistory();
}

/**
 * Setup artwork event listeners
 */
function setupArtworkEventListeners() {
    // Main generation button
    const generateBtn = document.getElementById('generateArtworkBtn');
    if (generateBtn) generateBtn.addEventListener('click', generateArtwork);
    
    // Advanced options toggle
    const toggleAdvanced = document.getElementById('toggleAdvancedOptions');
    if (toggleAdvanced) toggleAdvanced.addEventListener('click', toggleAdvancedOptions);
    
    // Action buttons
    const downloadBtn = document.getElementById('downloadArtwork');
    const saveBtn = document.getElementById('saveArtwork');
    const regenerateBtn = document.getElementById('regenerateArtwork');
    const variationsBtn = document.getElementById('variationsArtwork');
    
    if (downloadBtn) downloadBtn.addEventListener('click', downloadCurrentArtwork);
    if (saveBtn) saveBtn.addEventListener('click', saveArtworkToProject);
    if (regenerateBtn) regenerateBtn.addEventListener('click', regenerateArtwork);
    if (variationsBtn) variationsBtn.addEventListener('click', generateVariations);
    
    // Upload button
    const uploadBtn = document.getElementById('uploadArtworkBtn');
    const uploadInput = document.getElementById('artworkUploadInput');
    
    if (uploadBtn && uploadInput) {
        uploadBtn.addEventListener('click', () => uploadInput.click());
        uploadInput.addEventListener('change', handleArtworkUpload);
    }
    
    // Clear history
    const clearHistory = document.getElementById('clearHistory');
    if (clearHistory) clearHistory.addEventListener('click', clearGenerationHistory);
}

/**
 * Load artwork data from current project
 */
function loadArtworkData() {
    if (!window.SongForge.app.currentProject || !window.SongForge.app.currentProject.artwork) return;
    
    const artwork = window.SongForge.app.currentProject.artwork;
    
    if (artwork.url) {
        displayArtwork(artwork.url, artwork.prompt || 'Uploaded artwork');
    }
}

/**
 * Load generation history
 */
function loadGenerationHistory() {
    const history = loadFromStorage('artwork-generation-history') || [];
    window.SongForge.artworkAI.generationHistory = history;
    renderGenerationHistory();
}

// =========================================
// ARTWORK GENERATION
// =========================================

/**
 * Generate artwork using AI
 */
async function generateArtwork() {
    const prompt = document.getElementById('artworkPrompt')?.value;
    const style = document.getElementById('artworkStyle')?.value;
    const aspectRatio = document.getElementById('aspectRatio')?.value;
    const negativePrompt = document.getE
