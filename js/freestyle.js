// =========================================
// FREESTYLE PRACTICE MODE FOR SONGFORGE
// =========================================

// Freestyle state
window.SongForge = window.SongForge || {};
window.SongForge.freestyle = {
    isActive: false,
    currentWord: '',
    wordTimer: null,
    wordInterval: 30, // seconds
    wordCategory: 'general',
    youtubePlayer: null,
    isYouTubeReady: false,
    wordHistory: [],
    sessionStats: {
        startTime: null,
        wordsShown: 0,
        sessionDuration: 0
    }
};

// Comprehensive word banks for freestyle practice
const FREESTYLE_WORD_BANKS = {
    general: [
        'success', 'dream', 'hustle', 'grind', 'money', 'power', 'respect', 'loyalty', 'family', 'friends',
        'struggle', 'overcome', 'achieve', 'believe', 'create', 'inspire', 'motivate', 'elevate', 'celebrate', 'dominate',
        'vision', 'mission', 'passion', 'action', 'reaction', 'satisfaction', 'dedication', 'education', 'elevation', 'creation',
        'journey', 'destination', 'exploration', 'revelation', 'transformation', 'determination', 'concentration', 'meditation', 'celebration', 'inspiration'
    ],
    emotions: [
        'love', 'hate', 'anger', 'peace', 'joy', 'pain', 'hope', 'fear', 'trust', 'doubt',
        'happy', 'sad', 'mad', 'glad', 'proud', 'strong', 'brave', 'free', 'wild', 'bold',
        'calm', 'storm', 'warm', 'cold', 'bright', 'dark', 'light', 'shadow', 'shine', 'glow',
        'heart', 'soul', 'mind', 'spirit', 'energy', 'vibe', 'feeling', 'healing', 'dealing', 'revealing'
    ],
    objects: [
        'car', 'house', 'phone', 'money', 'chain', 'watch', 'shoes', 'clothes', 'crown', 'throne',
        'mic', 'stage', 'light', 'sound', 'beat', 'flow', 'rhythm', 'melody', 'harmony', 'symphony',
        'street', 'block', 'city', 'town', 'road', 'path', 'bridge', 'tunnel', 'mountain', 'valley',
        'star', 'moon', 'sun', 'sky', 'cloud', 'rain', 'snow', 'fire', 'water', 'earth'
    ],
    actions: [
        'run', 'walk', 'talk', 'sing', 'dance', 'jump', 'fly', 'drive', 'ride', 'slide',
        'climb', 'fall', 'rise', 'fight', 'win', 'lose', 'choose', 'move', 'groove', 'prove',
        'build', 'create', 'make', 'break', 'take', 'give', 'live', 'breathe', 'believe', 'achieve',
        'start', 'stop', 'go', 'come', 'stay', 'play', 'work', 'rest', 'test', 'best'
    ],
    colors: [
        'red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'black', 'white', 'gray',
        'gold', 'silver', 'bronze', 'copper', 'platinum', 'diamond', 'ruby', 'emerald', 'sapphire', 'crystal',
        'bright', 'dark', 'light', 'neon', 'pastel', 'vivid', 'bold', 'soft', 'warm', 'cool'
    ],
    places: [
        'home', 'school', 'work', 'park', 'mall', 'club', 'bar', 'restaurant', 'hotel', 'airport',
        'city', 'town', 'village', 'country', 'state', 'nation', 'world', 'universe', 'galaxy', 'planet',
        'beach', 'mountain', 'forest', 'desert', 'ocean', 'river', 'lake', 'stream', 'valley', 'hill'
    ],
    music: [
        'beat', 'rhythm', 'melody', 'harmony', 'bass', 'treble', 'tempo', 'flow', 'bars', 'verse',
        'chorus', 'hook', 'bridge', 'intro', 'outro', 'sample', 'loop', 'track', 'song', 'album',
        'studio', 'booth', 'mic', 'speaker', 'headphone', 'mixer', 'producer', 'artist', 'rapper', 'singer'
    ],
    time: [
        'now', 'then', 'past', 'future', 'present', 'today', 'tomorrow', 'yesterday', 'morning', 'evening',
        'day', 'night', 'week', 'month', 'year', 'decade', 'century', 'moment', 'second', 'minute',
        'hour', 'dawn', 'dusk', 'midnight', 'noon', 'sunrise', 'sunset', 'twilight', 'daybreak', 'nightfall'
    ]
};

// =========================================
// FREESTYLE INITIALIZATION
// =========================================

/**
 * Initialize freestyle mode
 */
function initializeFreestyle() {
    setupFreestyleEventListeners();
    loadYouTubeAPIForFreestyle();
    resetFreestyleSession();
}

/**
 * Setup freestyle event listeners
 */
function setupFreestyleEventListeners() {
    // YouTube URL input and load button
    const youtubeInput = document.getElementById('freestyleYoutubeUrl');
    const loadBeatBtn = document.getElementById('loadFreestyleBeat');
    
    if (youtubeInput) {
        youtubeInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                loadFreestyleBeat();
            }
        });
    }
    
    if (loadBeatBtn) {
        loadBeatBtn.addEventListener('click', loadFreestyleBeat);
    }
    
    // Freestyle controls
    const startBtn = document.getElementById('startFreestyle');
    const stopBtn = document.getElementById('stopFreestyle');
    
    if (startBtn) startBtn.addEventListener('click', startFreestyleSession);
    if (stopBtn) stopBtn.addEventListener('click', stopFreestyleSession);
    
    // Settings
    const wordFrequency = document.getElementById('wordFrequency');
    const wordCategory = document.getElementById('wordCategory');
    
    if (wordFrequency) {
        wordFrequency.addEventListener('change', (e) => {
            window.SongForge.freestyle.wordInterval = parseInt(e.target.value);
        });
    }
    
    if (wordCategory) {
        wordCategory.addEventListener('change', (e) => {
            window.SongForge.freestyle.wordCategory = e.target.value;
        });
    }
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Only apply shortcuts when in freestyle mode
        if (window.SongForge.app.currentScreen !== 'freestyle') return;
        
        // Space - Start/Stop freestyle
        if (e.code === 'Space' && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
            e.preventDefault();
            if (window.SongForge.freestyle.isActive) {
                stopFreestyleSession();
            } else {
                startFreestyleSession();
            }
        }
        
        // N - Next word manually
        if (e.key === 'n' && window.SongForge.freestyle.isActive) {
            e.preventDefault();
            showNextWord();
        }
        
        // P - Pause/Resume YouTube
        if (e.key === 'p' && window.SongForge.freestyle.youtubePlayer) {
            e.preventDefault();
            toggleYouTubePlayback();
        }
    });
}

/**
 * Load YouTube API for freestyle
 */
function loadYouTubeAPIForFreestyle() {
    // Check if YouTube API is already loaded
    if (window.YT && window.YT.Player) {
        window.SongForge.freestyle.isYouTubeReady = true;
        return;
    }
    
    // Set up callback for when API is ready
    const originalCallback = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = function() {
        if (originalCallback) originalCallback();
        window.SongForge.freestyle.isYouTubeReady = true;
        console.log('YouTube API ready for freestyle');
    };
    
    // Load API if not already loaded
    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
        const script = document.createElement('script');
        script.src = 'https://www.youtube.com/iframe_api';
        script.async = true;
        document.head.appendChild(script);
    }
}

/**
 * Reset freestyle session
 */
function resetFreestyleSession() {
    window.SongForge.freestyle.sessionStats = {
        startTime: null,
        wordsShown: 0,
        sessionDuration: 0
    };
    window.SongForge.freestyle.wordHistory = [];
    
    updateWordDisplay('Ready?', '');
}

// =========================================
// YOUTUBE INTEGRATION
// =========================================

/**
 * Load freestyle beat from YouTube
 */
function loadFreestyleBeat() {
    const urlInput = document.getElementById('freestyleYoutubeUrl');
    if (!urlInput || !urlInput.value.trim()) {
        showNotification('Please enter a YouTube URL', 'error');
        return;
    }
    
    const videoId = extractYouTubeVideoId(urlInput.value);
    if (!videoId) {
        showNotification('Invalid YouTube URL', 'error');
        return;
    }
    
    if (!window.YT || !window.YT.Player) {
        showNotification('YouTube API not ready. Please try again in a moment.', 'info');
        return;
    }
    
    const container = document.getElementById('freestyleVideoContainer');
    if (!container) return;
    
    // Clear previous player
    if (window.SongForge.freestyle.youtubePlayer) {
        window.SongForge.freestyle.youtubePlayer.destroy();
    }
    
    // Create container for player
    container.innerHTML = '<div id="freestyleYouTubePlayer"></div>';
    container.classList.remove('hidden');
    
    // Create YouTube player
    window.SongForge.freestyle.youtubePlayer = new YT.Player('freestyleYouTubePlayer', {
        height: '315',
        width: '560',
        videoId: videoId,
        playerVars: {
            autoplay: 0,
            controls: 1,
            rel: 0,
            showinfo: 0,
            modestbranding: 1,
            loop: 1,
            playlist: videoId // Required for looping single video
        },
        events: {
            onReady: onFreestylePlayerReady,
            onStateChange: onFreestylePlayerStateChange,
            onError: onFreestylePlayerError
        }
    });
    
    showNotification('YouTube beat loaded successfully', 'success');
}

/**
 * Freestyle player ready callback
 */
function onFreestylePlayerReady(event) {
    console.log('Freestyle YouTube player ready');
    // Set initial volume
    event.target.setVolume(70);
}

/**
 * Freestyle player state change callback
 */
function onFreestylePlayerStateChange(event) {
    // Auto-restart video when it ends (for looping)
    if (event.data === YT.PlayerState.ENDED) {
        event.target.playVideo();
    }
}

/**
 * Freestyle player error callback
 */
function onFreestylePlayerError(event) {
    console.error('Freestyle YouTube player error:', event.data);
    showNotification('Error loading YouTube video', 'error');
}

/**
 * Toggle YouTube playback
 */
function toggleYouTubePlayback() {
    if (!window.SongForge.freestyle.youtubePlayer) return;
    
    const state = window.SongForge.freestyle.youtubePlayer.getPlayerState();
    
    if (state === YT.PlayerState.PLAYING) {
        window.SongForge.freestyle.youtubePlayer.pauseVideo();
    } else {
        window.SongForge.freestyle.youtubePlayer.playVideo();
    }
}

// =========================================
// FREESTYLE SESSION MANAGEMENT
// =========================================

/**
 * Start freestyle session
 */
function startFreestyleSession() {
    if (window.SongForge.freestyle.isActive) return;
    
    // Check if YouTube player is available
    if (!window.SongForge.freestyle.youtubePlayer) {
        showNotification('Please load a YouTube beat first', 'error');
        return;
    }
    
    // Start session
    window.SongForge.freestyle.isActive = true;
    window.SongForge.freestyle.sessionStats.startTime = new Date();
    window.SongForge.freestyle.sessionStats.wordsShown = 0;
    
    // Update UI
    updateFreestyleUI(true);
    
    // Start YouTube playback
    window.SongForge.freestyle.youtubePlayer.playVideo();
    
    // Show first word
    showNextWord();
    
    // Start word timer
    startWordTimer();
    
    showNotification('Freestyle session started! Use Space to pause, N for next word, P for play/pause', 'success');
}

/**
 * Stop freestyle session
 */
function stopFreestyleSession() {
    if (!window.SongForge.freestyle.isActive) return;
    
    // Stop session
    window.SongForge.freestyle.isActive = false;
    
    // Calculate session duration
    if (window.SongForge.freestyle.sessionStats.startTime) {
        window.SongForge.freestyle.sessionStats.sessionDuration = 
            (new Date() - window.SongForge.freestyle.sessionStats.startTime) / 1000;
    }
    
    // Stop timers
    stopWordTimer();
    
    // Update UI
    updateFreestyleUI(false);
    
    // Pause YouTube
    if (window.SongForge.freestyle.youtubePlayer) {
        window.SongForge.freestyle.youtubePlayer.pauseVideo();
    }
    
    // Show session stats
    showSessionStats();
    
    showNotification('Freestyle session ended', 'info');
}

/**
 * Update freestyle UI
 */
function updateFreestyleUI(isActive) {
    const startBtn = document.getElementById('startFreestyle');
    const stopBtn = document.getElementById('stopFreestyle');
    
    if (startBtn && stopBtn) {
        if (isActive) {
            startBtn.classList.add('hidden');
            stopBtn.classList.remove('hidden');
        } else {
            startBtn.classList.remove('hidden');
            stopBtn.classList.add('hidden');
        }
    }
}

/**
 * Show session statistics
 */
function showSessionStats() {
    const stats = window.SongForge.freestyle.sessionStats;
    const duration = Math.floor(stats.sessionDuration);
    const wordsPerMinute = duration > 0 ? Math.round((stats.wordsShown / duration) * 60) : 0;
    
    const content = `
        <div class="space-y-4">
            <h3 class="text-lg font-semibold">Freestyle Session Complete!</h3>
            
            <div class="grid grid-cols-2 gap-4 text-center">
                <div class="bg-light-bg dark:bg-dark-bg p-4 rounded-lg">
                    <div class="text-2xl font-bold text-primary">${stats.wordsShown}</div>
                    <div class="text-sm text-gray-500">Words Practiced</div>
                </div>
                <div class="bg-light-bg dark:bg-dark-bg p-4 rounded-lg">
                    <div class="text-2xl font-bold text-secondary">${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}</div>
                    <div class="text-sm text-gray-500">Duration</div>
                </div>
            </div>
            
            <div class="text-center">
                <div class="text-lg font-semibold">${wordsPerMinute} words/minute</div>
                <div class="text-sm text-gray-500">Average pace</div>
            </div>
            
            ${window.SongForge.freestyle.wordHistory.length > 0 ? `
                <div>
                    <h4 class="font-medium mb-2">Words Practiced:</h4>
                    <div class="flex flex-wrap gap-1 max-h-24 overflow-y-auto custom-scrollbar">
                        ${window.SongForge.freestyle.wordHistory.map(word => 
                            `<span class="text-xs bg-primary bg-opacity-20 text-primary px-2 py-1 rounded">${word}</span>`
                        ).join('')}
                    </div>
                </div>
            ` : ''}
            
            <button onclick="closeModal()" 
                    class="w-full bg-primary hover:bg-primary-dark text-white py-2 px-4 rounded-lg transition-colors">
                Close
            </button>
        </div>
    `;
    
    showModal('Session Complete', content);
}

// =========================================
// WORD MANAGEMENT
// =========================================

/**
 * Start word timer
 */
function startWordTimer() {
    if (window.SongForge.freestyle.wordTimer) {
        clearInterval(window.SongForge.freestyle.wordTimer);
    }
    
    window.SongForge.freestyle.wordTimer = setInterval(() => {
        if (window.SongForge.freestyle.isActive) {
            showNextWord();
        }
    }, window.SongForge.freestyle.wordInterval * 1000);
}

/**
 * Stop word timer
 */
function stopWordTimer() {
    if (window.SongForge.freestyle.wordTimer) {
        clearInterval(window.SongForge.freestyle.wordTimer);
        window.SongForge.freestyle.wordTimer = null;
    }
}

/**
 * Show next word
 */
function showNextWord() {
    const category = window.SongForge.freestyle.wordCategory;
    const wordBank = FREESTYLE_WORD_BANKS[category] || FREESTYLE_WORD_BANKS.general;
    
    // Get random word that's different from current word
    let newWord;
    let attempts = 0;
    do {
        newWord = wordBank[Math.floor(Math.random() * wordBank.length)];
        attempts++;
    } while (newWord === window.SongForge.freestyle.currentWord && attempts < 10);
    
    window.SongForge.freestyle.currentWord = newWord;
    window.SongForge.freestyle.wordHistory.push(newWord);
    window.SongForge.freestyle.sessionStats.wordsShown++;
    
    // Update display
    updateWordDisplay(newWord, `Next word in ${window.SongForge.freestyle.wordInterval}s`);
    
    // Start countdown
    startWordCountdown();
}

/**
 * Update word display
 */
function updateWordDisplay(word, timer) {
    const wordElement = document.getElementById('currentWord');
    const timerElement = document.getElementById('nextWordTimer');
    
    if (wordElement) {
        wordElement.textContent = word;
        
        // Add animation
        wordElement.classList.remove('animate-pulse');
        void wordElement.offsetWidth; // Trigger reflow
        wordElement.classList.add('animate-pulse');
        
        setTimeout(() => {
            wordElement.classList.remove('animate-pulse');
        }, 500);
    }
    
    if (timerElement) {
        timerElement.textContent = timer;
    }
}

/**
 * Start word countdown
 */
function startWordCountdown() {
    if (!window.SongForge.freestyle.isActive) return;
    
    let timeLeft = window.SongForge.freestyle.wordInterval;
    
    const countdownTimer = setInterval(() => {
        timeLeft--;
        
        if (timeLeft > 0 && window.SongForge.freestyle.isActive) {
            updateWordDisplay(window.SongForge.freestyle.currentWord, `Next word in ${timeLeft}s`);
        } else {
            clearInterval(countdownTimer);
        }
    }, 1000);
}

// =========================================
// WORD CATEGORIES AND SUGGESTIONS
// =========================================

/**
 * Get random word from category
 */
function getRandomWordFromCategory(category) {
    const wordBank = FREESTYLE_WORD_BANKS[category] || FREESTYLE_WORD_BANKS.general;
    return wordBank[Math.floor(Math.random() * wordBank.length)];
}

/**
 * Get rhyming words for current word
 */
function getRhymingWords(word) {
    // Simple rhyme patterns
    const rhymePatterns = {
        'ay': ['day', 'way', 'say', 'play', 'stay', 'may', 'bay', 'lay', 'pay', 'gray'],
        'ight': ['night', 'light', 'sight', 'fight', 'right', 'might', 'bright', 'tight', 'flight', 'height'],
        'ove': ['love', 'above', 'dove', 'shove', 'glove'],
        'ound': ['sound', 'ground', 'round', 'found', 'bound', 'pound'],
        'eart': ['heart', 'start', 'part', 'smart', 'art', 'chart'],
        'ime': ['time', 'rhyme', 'climb', 'prime', 'mime', 'chime']
    };
    
    // Find pattern
    for (const [pattern, words] of Object.entries(rhymePatterns)) {
        if (word.endsWith(pattern.slice(-2))) {
            return words.filter(w => w !== word);
        }
    }
    
    return [];
}

/**
 * Add word suggestion functionality
 */
function addWordSuggestions() {
    // This could be expanded to show rhyming words or related words
    // in the UI during freestyle sessions
}

// =========================================
// FREESTYLE UTILITIES
// =========================================

/**
 * Save freestyle session
 */
function saveFreestyleSession() {
    const session = {
        timestamp: new Date().toISOString(),
        stats: window.SongForge.freestyle.sessionStats,
        wordHistory: window.SongForge.freestyle.wordHistory,
        settings: {
            wordInterval: window.SongForge.freestyle.wordInterval,
            wordCategory: window.SongForge.freestyle.wordCategory
        }
    };
    
    // Save to storage
    const sessions = loadFromStorage('freestyle-sessions') || [];
    sessions.unshift(session);
    
    // Keep only last 10 sessions
    if (sessions.length > 10) {
        sessions.splice(10);
    }
    
    saveToStorage('freestyle-sessions', sessions);
}

/**
 * Load freestyle history
 */
function loadFreestyleHistory() {
    return loadFromStorage('freestyle-sessions') || [];
}

/**
 * Get freestyle statistics
 */
function getFreestyleStats() {
    const sessions = loadFreestyleHistory();
    
    if (sessions.length === 0) {
        return {
            totalSessions: 0,
            totalWords: 0,
            totalTime: 0,
            averageWordsPerMinute: 0
        };
    }
    
    const totalWords = sessions.reduce((sum, session) => sum + session.stats.wordsShown, 0);
    const totalTime = sessions.reduce((sum, session) => sum + session.stats.sessionDuration, 0);
    const averageWordsPerMinute = totalTime > 0 ? Math.round((totalWords / totalTime) * 60) : 0;
    
    return {
        totalSessions: sessions.length,
        totalWords: totalWords,
        totalTime: Math.floor(totalTime),
        averageWordsPerMinute: averageWordsPerMinute
    };
}

// =========================================
// CLEANUP
// =========================================

/**
 * Cleanup freestyle resources
 */
function cleanupFreestyle() {
    // Stop session if active
    if (window.SongForge.freestyle.isActive) {
        stopFreestyleSession();
    }
    
    // Stop timers
    stopWordTimer();
    
    // Destroy YouTube player
    if (window.SongForge.freestyle.youtubePlayer) {
        window.SongForge.freestyle.youtubePlayer.destroy();
        window.SongForge.freestyle.youtubePlayer = null;
    }
    
    // Reset state
    resetFreestyleSession();
}

// Cleanup on page unload
window.addEventListener('beforeunload', cleanupFreestyle);

// Make functions globally available
window.showNextWord = showNextWord;

console.log('Freestyle system initialized');
