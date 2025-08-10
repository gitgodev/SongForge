// =========================================
// BEATS MANAGEMENT FOR SONGFORGE
// =========================================

// Beats system state
window.SongForge = window.SongForge || {};
window.SongForge.beats = {
    currentBeat: null,
    youtube: {
        player: null,
        videoId: null,
        isReady: false
    }
};

// =========================================
// BEATS CONTENT LOADING
// =========================================

/**
 * Load beats content into tab
 */
function loadBeatsContent() {
    const tabContent = document.getElementById('tabContent');
    if (!tabContent) return;
    
    tabContent.innerHTML = `
        <div class="grid lg:grid-cols-2 gap-6">
            <!-- Beat Information -->
            <div class="bg-light-panel dark:bg-dark-panel rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                <h3 class="text-lg font-semibold mb-4">Beat Information</h3>
                
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium mb-1">Beat Title</label>
                        <input type="text" id="beatTitle" placeholder="Enter beat title..." 
                               class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-light-bg dark:bg-dark-bg text-base">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium mb-1">Producer Name</label>
                        <input type="text" id="producerName" placeholder="Producer or beat maker name..." 
                               class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-light-bg dark:bg-dark-bg text-base">
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium mb-1">YouTube Link (Optional)</label>
                        <input type="url" id="youtubeLink" placeholder="https://youtube.com/watch?v=..." 
                               class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-light-bg dark:bg-dark-bg text-base">
                        <button id="loadYoutubeBtn" class="mt-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors">
                            <i data-lucide="youtube" class="w-4 h-4 mr-2 inline"></i>
                            Load from YouTube
                        </button>
                    </div>
                    
                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium mb-1">Lease/Purchase Link</label>
                            <input type="url" id="purchaseLink" placeholder="https://beatstore.com/..." 
                                   class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-light-bg dark:bg-dark-bg text-base">
                        </div>
                        <div>
                            <label class="block text-sm font-medium mb-1">Price</label>
                            <input type="text" id="beatPrice" placeholder="$25 (Lease) / $100 (Exclusive)" 
                                   class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-light-bg dark:bg-dark-bg text-base">
                        </div>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium mb-1">License Type</label>
                        <select id="licenseType" class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-light-bg dark:bg-dark-bg text-base">
                            <option value="">Select license type...</option>
                            <option value="basic-lease">Basic Lease</option>
                            <option value="premium-lease">Premium Lease</option>
                            <option value="trackout-lease">Trackout Lease</option>
                            <option value="exclusive">Exclusive Rights</option>
                            <option value="custom">Custom Agreement</option>
                            <option value="royalty-free">Royalty Free</option>
                        </select>
                    </div>
                    
                    <div>
                        <label class="block text-sm font-medium mb-1">Beat Tags/Description</label>
                        <textarea id="beatTags" placeholder="e.g., trap, 140 BPM, dark, hard, piano, 808s..." 
                                 class="w-full h-20 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-light-bg dark:bg-dark-bg resize-none text-base"></textarea>
                    </div>
                </div>
                
                <div class="mt-6 flex space-x-3">
                    <button id="saveBeatInfo" class="flex-1 bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-lg transition-colors">
                        Save Beat Info
                    </button>
                    <button id="clearBeatInfo" class="bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors">
                        Clear
                    </button>
                </div>
            </div>
            
            <!-- Beat Player -->
            <div class="bg-light-panel dark:bg-dark-panel rounded-xl p-6 border border-gray-200 dark:border-gray-800">
                <h3 class="text-lg font-semibold mb-4">Beat Player</h3>
                
                <div id="beatPlayerContainer" class="mb-4">
                    <div id="youtubePlaceholder" class="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                        <div class="text-center text-gray-500">
                            <i data-lucide="music" class="w-12 h-12 mx-auto mb-2"></i>
                            <p>Load a YouTube beat to start</p>
                            <p class="text-sm">Or paste a YouTube link above</p>
                        </div>
                    </div>
                    <div id="youtubePlayer" class="hidden aspect-video"></div>
                </div>
                
                <div id="beatControls" class="hidden">
                    <div class="flex items-center justify-center space-x-4 mb-4">
                        <button id="beatPlayBtn" class="bg-green-500 hover:bg-green-600 text-white p-3 rounded-full transition-colors">
                            <i data-lucide="play" class="w-5 h-5"></i>
                        </button>
                        <button id="beatPauseBtn" class="bg-yellow-500 hover:bg-yellow-600 text-white p-3 rounded-full transition-colors">
                            <i data-lucide="pause" class="w-5 h-5"></i>
                        </button>
                        <button id="beatStopBtn" class="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full transition-colors">
                            <i data-lucide="square" class="w-5 h-5"></i>
                        </button>
                    </div>
                    
                    <div class="space-y-3">
                        <div>
                            <label class="block text-sm font-medium mb-2">Volume</label>
                            <input type="range" id="beatVolumeSlider" min="0" max="100" value="50" 
                                   class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700">
                        </div>
                        
                        <div id="beatTimeDisplay" class="flex justify-between text-sm text-gray-500">
                            <span id="currentTime">0:00</span>
                            <span id="totalTime">0:00</span>
                        </div>
                    </div>
                </div>
                
                <div id="beatInfoDisplay" class="hidden mt-4 p-4 bg-light-bg dark:bg-dark-bg rounded-lg">
                    <h4 class="font-medium mb-2">Current Beat</h4>
                    <div id="beatInfoContent" class="text-sm space-y-1">
                        <!-- Beat info will be displayed here -->
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Beat Library (Future Feature) -->
        <div class="mt-6 bg-light-panel dark:bg-dark-panel rounded-xl p-6 border border-gray-200 dark:border-gray-800">
            <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-semibold">Beat Library</h3>
                <span class="text-sm text-gray-500">Saved beats for this project</span>
            </div>
            <div id="beatLibrary" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <!-- Saved beats will appear here -->
                <div class="text-center py-8 text-gray-500 col-span-full">
                    <i data-lucide="folder-music" class="w-12 h-12 mx-auto mb-3 opacity-50"></i>
                    <p>No beats saved yet</p>
                    <p class="text-sm">Add beat information above to save to library</p>
                </div>
            </div>
        </div>
    `;
    
    // Initialize beat management
    initializeBeats();
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// =========================================
// BEATS INITIALIZATION
// =========================================

/**
 * Initialize beats system
 */
function initializeBeats() {
    setupBeatEventListeners();
    loadYouTubeAPI();
    loadBeatData();
}

/**
 * Setup beat event listeners
 */
function setupBeatEventListeners() {
    // Beat info inputs
    const beatInputs = [
        { id: 'beatTitle', property: 'title' },
        { id: 'producerName', property: 'producer' },
        { id: 'youtubeLink', property: 'youtubeUrl' },
        { id: 'purchaseLink', property: 'purchaseUrl' },
        { id: 'beatPrice', property: 'price' },
        { id: 'licenseType', property: 'license' },
        { id: 'beatTags', property: 'tags' }
    ];
    
    beatInputs.forEach(({ id, property }) => {
        const element = document.getElementById(id);
        if (element) {
            const handler = debounce((e) => {
                updateBeatProperty(property, e.target.value);
            }, 300);
            element.addEventListener('input', handler);
        }
    });
    
    // Action buttons
    const loadYoutubeBtn = document.getElementById('loadYoutubeBtn');
    const saveBeatInfo = document.getElementById('saveBeatInfo');
    const clearBeatInfo = document.getElementById('clearBeatInfo');
    
    if (loadYoutubeBtn) loadYoutubeBtn.addEventListener('click', loadYouTubeVideo);
    if (saveBeatInfo) saveBeatInfo.addEventListener('click', saveBeatToLibrary);
    if (clearBeatInfo) clearBeatInfo.addEventListener('click', clearBeatInformation);
    
    // Player controls
    const beatPlayBtn = document.getElementById('beatPlayBtn');
    const beatPauseBtn = document.getElementById('beatPauseBtn');
    const beatStopBtn = document.getElementById('beatStopBtn');
    const beatVolumeSlider = document.getElementById('beatVolumeSlider');
    
    if (beatPlayBtn) beatPlayBtn.addEventListener('click', playYouTubeVideo);
    if (beatPauseBtn) beatPauseBtn.addEventListener('click', pauseYouTubeVideo);
    if (beatStopBtn) beatStopBtn.addEventListener('click', stopYouTubeVideo);
    if (beatVolumeSlider) beatVolumeSlider.addEventListener('input', updateYouTubeVolume);
}

/**
 * Load beat data from current project
 */
function loadBeatData() {
    if (!window.SongForge.app.currentProject || !window.SongForge.app.currentProject.beat) return;
    
    const beat = window.SongForge.app.currentProject.beat;
    
    // Populate form fields
    const updates = [
        { id: 'beatTitle', value: beat.title },
        { id: 'producerName', value: beat.producer },
        { id: 'youtubeLink', value: beat.youtubeUrl },
        { id: 'purchaseLink', value: beat.purchaseUrl },
        { id: 'beatPrice', value: beat.price },
        { id: 'licenseType', value: beat.license },
        { id: 'beatTags', value: beat.tags }
    ];
    
    updates.forEach(({ id, value }) => {
        const element = document.getElementById(id);
        if (element && value) {
            element.value = value;
        }
    });
    
    // Load YouTube video if available
    if (beat.youtubeUrl) {
        setTimeout(() => {
            loadYouTubeVideo();
        }, 1000);
    }
    
    displayBeatInfo();
}

/**
 * Update beat property
 */
function updateBeatProperty(property, value) {
    if (!window.SongForge.app.currentProject) return;
    
    if (!window.SongForge.app.currentProject.beat) {
        window.SongForge.app.currentProject.beat = {};
    }
    
    window.SongForge.app.currentProject.beat[property] = value;
    window.SongForge.beats.currentBeat = window.SongForge.app.currentProject.beat;
    
    markProjectModified();
    displayBeatInfo();
}

// =========================================
// YOUTUBE INTEGRATION
// =========================================

/**
 * Load YouTube API
 */
function loadYouTubeAPI() {
    // Only load if not already loaded
    if (window.YT && window.YT.Player) {
        return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://www.youtube.com/iframe_api';
    script.async = true;
    document.head.appendChild(script);
    
    // Set up callback for when API is ready
    window.onYouTubeIframeAPIReady = initializeYouTubePlayer;
}

/**
 * Initialize YouTube player
 */
function initializeYouTubePlayer() {
    console.log('YouTube API ready');
    window.SongForge.beats.youtube.isReady = true;
}

/**
 * Extract YouTube video ID from URL
 */
function extractYouTubeVideoId(url) {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

/**
 * Load YouTube video
 */
function loadYouTubeVideo() {
    const youtubeLink = document.getElementById('youtubeLink');
    if (!youtubeLink || !youtubeLink.value) {
        showNotification('Please enter a YouTube URL', 'error');
        return;
    }
    
    const videoId = extractYouTubeVideoId(youtubeLink.value);
    if (!videoId) {
        showNotification('Invalid YouTube URL', 'error');
        return;
    }
    
    if (!window.YT || !window.YT.Player) {
        showNotification('YouTube API not ready. Please try again in a moment.', 'info');
        return;
    }
    
    // Hide placeholder and show player container
    const placeholder = document.getElementById('youtubePlaceholder');
    const playerContainer = document.getElementById('youtubePlayer');
    const beatControls = document.getElementById('beatControls');
    
    if (placeholder) placeholder.classList.add('hidden');
    if (playerContainer) playerContainer.classList.remove('hidden');
    if (beatControls) beatControls.classList.remove('hidden');
    
    // Create YouTube player
    window.SongForge.beats.youtube.player = new YT.Player('youtubePlayer', {
        height: '315',
        width: '560',
        videoId: videoId,
        playerVars: {
            autoplay: 0,
            controls: 1,
            rel: 0,
            showinfo: 0,
            modestbranding: 1
        },
        events: {
            onReady: onYouTubePlayerReady,
            onStateChange: onYouTubePlayerStateChange,
            onError: onYouTubePlayerError
        }
    });
    
    window.SongForge.beats.youtube.videoId = videoId;
    updateBeatProperty('youtubeId', videoId);
    
    showNotification('YouTube video loaded successfully', 'success');
}

/**
 * YouTube player ready callback
 */
function onYouTubePlayerReady(event) {
    console.log('YouTube player ready');
    updateTimeDisplay();
}

/**
 * YouTube player state change callback
 */
function onYouTubePlayerStateChange(event) {
    if (event.data === YT.PlayerState.PLAYING) {
        startTimeUpdater();
    } else {
        stopTimeUpdater();
    }
}

/**
 * YouTube player error callback
 */
function onYouTubePlayerError(event) {
    console.error('YouTube player error:', event.data);
    showNotification('Error loading YouTube video', 'error');
}

/**
 * Play YouTube video
 */
function playYouTubeVideo() {
    if (window.SongForge.beats.youtube.player) {
        window.SongForge.beats.youtube.player.playVideo();
    }
}

/**
 * Pause YouTube video
 */
function pauseYouTubeVideo() {
    if (window.SongForge.beats.youtube.player) {
        window.SongForge.beats.youtube.player.pauseVideo();
    }
}

/**
 * Stop YouTube video
 */
function stopYouTubeVideo() {
    if (window.SongForge.beats.youtube.player) {
        window.SongForge.beats.youtube.player.stopVideo();
    }
}

/**
 * Update YouTube volume
 */
function updateYouTubeVolume() {
    const slider = document.getElementById('beatVolumeSlider');
    if (window.SongForge.beats.youtube.player && slider) {
        window.SongForge.beats.youtube.player.setVolume(slider.value);
    }
}

/**
 * Update time display
 */
function updateTimeDisplay() {
    if (!window.SongForge.beats.youtube.player) return;
    
    const currentTime = window.SongForge.beats.youtube.player.getCurrentTime();
    const duration = window.SongForge.beats.youtube.player.getDuration();
    
    const currentTimeElement = document.getElementById('currentTime');
    const totalTimeElement = document.getElementById('totalTime');
    
    if (currentTimeElement) {
        currentTimeElement.textContent = formatTime(currentTime);
    }
    
    if (totalTimeElement) {
        totalTimeElement.textContent = formatTime(duration);
    }
}

/**
 * Start time updater
 */
function startTimeUpdater() {
    if (window.SongForge.beats.timeUpdater) {
        clearInterval(window.SongForge.beats.timeUpdater);
    }
    
    window.SongForge.beats.timeUpdater = setInterval(updateTimeDisplay, 1000);
}

/**
 * Stop time updater
 */
function stopTimeUpdater() {
    if (window.SongForge.beats.timeUpdater) {
        clearInterval(window.SongForge.beats.timeUpdater);
        window.SongForge.beats.timeUpdater = null;
    }
}

/**
 * Format time in MM:SS
 */
function formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// =========================================
// BEAT LIBRARY MANAGEMENT
// =========================================

/**
 * Save beat to library
 */
function saveBeatToLibrary() {
    if (!window.SongForge.app.currentProject.beat) {
        showNotification('No beat information to save', 'error');
        return;
    }
    
    const beat = window.SongForge.app.currentProject.beat;
    
    // Validate required fields
    if (!beat.title || !beat.producer) {
        showNotification('Please enter at least beat title and producer name', 'error');
        return;
    }
    
    // Initialize beat library if it doesn't exist
    if (!window.SongForge.app.currentProject.beatLibrary) {
        window.SongForge.app.currentProject.beatLibrary = [];
    }
    
    // Add timestamp and ID
    const savedBeat = {
        ...beat,
        id: generateId(),
        savedAt: new Date().toISOString()
    };
    
    window.SongForge.app.currentProject.beatLibrary.push(savedBeat);
    renderBeatLibrary();
    markProjectModified();
    
    showNotification('Beat saved to library', 'success');
}

/**
 * Clear beat information
 */
function clearBeatInformation() {
    showConfirmDialog('Are you sure you want to clear all beat information?', () => {
        // Clear form fields
        const fields = ['beatTitle', 'producerName', 'youtubeLink', 'purchaseLink', 'beatPrice', 'licenseType', 'beatTags'];
        fields.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.value = '';
        });
        
        // Clear current beat data
        if (window.SongForge.app.currentProject) {
            window.SongForge.app.currentProject.beat = null;
        }
        window.SongForge.beats.currentBeat = null;
        
        // Hide player and show placeholder
        const placeholder = document.getElementById('youtubePlaceholder');
        const playerContainer = document.getElementById('youtubePlayer');
        const beatControls = document.getElementById('beatControls');
        const beatInfoDisplay = document.getElementById('beatInfoDisplay');
        
        if (placeholder) placeholder.classList.remove('hidden');
        if (playerContainer) playerContainer.classList.add('hidden');
        if (beatControls) beatControls.classList.add('hidden');
        if (beatInfoDisplay) beatInfoDisplay.classList.add('hidden');
        
        // Stop YouTube player
        if (window.SongForge.beats.youtube.player) {
            window.SongForge.beats.youtube.player.destroy();
            window.SongForge.beats.youtube.player = null;
        }
        
        markProjectModified();
        showNotification('Beat information cleared', 'info');
    });
}

/**
 * Display beat info
 */
function displayBeatInfo() {
    const beatInfoDisplay = document.getElementById('beatInfoDisplay');
    const beatInfoContent = document.getElementById('beatInfoContent');
    
    if (!beatInfoDisplay || !beatInfoContent) return;
    
    const beat = window.SongForge.beats.currentBeat;
    
    if (!beat || !beat.title) {
        beatInfoDisplay.classList.add('hidden');
        return;
    }
    
    beatInfoDisplay.classList.remove('hidden');
    
    beatInfoContent.innerHTML = `
        <div class="grid grid-cols-2 gap-2">
            ${beat.title ? `<div><strong>Title:</strong> ${beat.title}</div>` : ''}
            ${beat.producer ? `<div><strong>Producer:</strong> ${beat.producer}</div>` : ''}
            ${beat.license ? `<div><strong>License:</strong> ${beat.license}</div>` : ''}
            ${beat.price ? `<div><strong>Price:</strong> ${beat.price}</div>` : ''}
            ${beat.tags ? `<div class="col-span-2"><strong>Tags:</strong> ${beat.tags}</div>` : ''}
        </div>
        ${beat.purchaseUrl ? `
            <div class="mt-2">
                <a href="${beat.purchaseUrl}" target="_blank" class="text-primary hover:text-primary-dark text-sm">
                    <i data-lucide="external-link" class="w-3 h-3 mr-1 inline"></i>
                    Purchase/License Beat
                </a>
            </div>
        ` : ''}
    `;
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

/**
 * Render beat library
 */
function renderBeatLibrary() {
    const container = document.getElementById('beatLibrary');
    if (!container) return;
    
    const library = window.SongForge.app.currentProject.beatLibrary || [];
    
    if (library.length === 0) {
        container.innerHTML = `
            <div class="text-center py-8 text-gray-500 col-span-full">
                <i data-lucide="folder-music" class="w-12 h-12 mx-auto mb-3 opacity-50"></i>
                <p>No beats saved yet</p>
                <p class="text-sm">Add beat information above to save to library</p>
            </div>
        `;
        if (typeof lucide !== 'undefined') lucide.createIcons();
        return;
    }
    
    container.innerHTML = library.map(beat => `
        <div class="bg-light-bg dark:bg-dark-bg rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:border-primary transition-colors">
            <h4 class="font-medium mb-2">${beat.title}</h4>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">by ${beat.producer}</p>
            ${beat.license ? `<span class="text-xs px-2 py-1 bg-primary bg-opacity-20 text-primary rounded">${beat.license}</span>` : ''}
            <div class="mt-3 flex space-x-2">
                <button onclick="loadBeatFromLibrary('${beat.id}')" class="text-xs bg-secondary hover:bg-secondary-dark text-white px-2 py-1 rounded transition-colors">
                    Load
                </button>
                <button onclick="deleteBeatFromLibrary('${beat.id}')" class="text-xs bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded transition-colors">
                    Delete
                </button>
            </div>
        </div>
    `).join('');
    
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

/**
 * Load beat from library
 */
function loadBeatFromLibrary(beatId) {
    const library = window.SongForge.app.currentProject.beatLibrary || [];
    const beat = library.find(b => b.id === beatId);
    
    if (!beat) {
        showNotification('Beat not found', 'error');
        return;
    }
    
    // Load beat data into form
    const updates = [
        { id: 'beatTitle', value: beat.title },
        { id: 'producerName', value: beat.producer },
        { id: 'youtubeLink', value: beat.youtubeUrl },
        { id: 'purchaseLink', value: beat.purchaseUrl },
        { id: 'beatPrice', value: beat.price },
        { id: 'licenseType', value: beat.license },
        { id: 'beatTags', value: beat.tags }
    ];
    
    updates.forEach(({ id, value }) => {
        const element = document.getElementById(id);
        if (element && value) {
            element.value = value;
        }
    });
    
    // Set as current beat
    window.SongForge.app.currentProject.beat = { ...beat };
    window.SongForge.beats.currentBeat = window.SongForge.app.currentProject.beat;
    
    // Load YouTube video if available
    if (beat.youtubeUrl) {
        setTimeout(() => {
            loadYouTubeVideo();
        }, 500);
    }
    
    displayBeatInfo();
    showNotification('Beat loaded from library', 'success');
}

/**
 * Delete beat from library
 */
function deleteBeatFromLibrary(beatId) {
    showConfirmDialog('Are you sure you want to delete this beat from the library?', () => {
        if (!window.SongForge.app.currentProject.beatLibrary) return;
        
        window.SongForge.app.currentProject.beatLibrary = window.SongForge.app.currentProject.beatLibrary
            .filter(beat => beat.id !== beatId);
        
        renderBeatLibrary();
        markProjectModified();
        showNotification('Beat deleted from library', 'info');
    });
}

// Make functions globally available
window.loadBeatFromLibrary = loadBeatFromLibrary;
window.deleteBeatFromLibrary = deleteBeatFromLibrary;

console.log('Beats system initialized');
