// =========================================
// UTILITY FUNCTIONS FOR SONGFORGE
// =========================================

// Global app state
window.SongForge = {
    currentProject: null,
    isRecording: false,
    mediaRecorder: null,
    recordedChunks: [],
    beatAudio: null,
    currentPlayback: null,
    audioContext: null,
    settings: {
        autoSave: true,
        darkMode: 'auto',
        notifications: true
    }
};

// =========================================
// DARK MODE UTILITIES
// =========================================

/**
 * Initialize dark mode based on user preference
 */
function initializeDarkMode() {
    const savedTheme = localStorage.getItem('songforge-theme');
    
    if (savedTheme === 'dark' || 
        (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
    }
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
        if (!localStorage.getItem('songforge-theme')) {
            if (event.matches) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        }
    });
}

/**
 * Toggle dark mode
 */
function toggleDarkMode() {
    const isDark = document.documentElement.classList.contains('dark');
    
    if (isDark) {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('songforge-theme', 'light');
    } else {
        document.documentElement.classList.add('dark');
        localStorage.setItem('songforge-theme', 'dark');
    }
    
    // Update icon
    updateThemeIcon();
}

/**
 * Update theme toggle icon
 */
function updateThemeIcon() {
    const isDark = document.documentElement.classList.contains('dark');
    const themeToggle = document.getElementById('themeToggle');
    
    if (themeToggle) {
        themeToggle.innerHTML = isDark 
            ? '<i data-lucide="sun" class="w-5 h-5"></i>'
            : '<i data-lucide="moon" class="w-5 h-5"></i>';
        lucide.createIcons();
    }
}

// =========================================
// LOCAL STORAGE UTILITIES
// =========================================

/**
 * Save data to localStorage with error handling
 */
function saveToStorage(key, data) {
    try {
        const jsonData = JSON.stringify(data);
        localStorage.setItem(`songforge-${key}`, jsonData);
        return true;
    } catch (error) {
        console.error('Failed to save to localStorage:', error);
        showNotification('Failed to save data locally', 'error');
        return false;
    }
}

/**
 * Load data from localStorage with error handling
 */
function loadFromStorage(key, defaultValue = null) {
    try {
        const data = localStorage.getItem(`songforge-${key}`);
        return data ? JSON.parse(data) : defaultValue;
    } catch (error) {
        console.error('Failed to load from localStorage:', error);
        return defaultValue;
    }
}

/**
 * Remove data from localStorage
 */
function removeFromStorage(key) {
    try {
        localStorage.removeItem(`songforge-${key}`);
        return true;
    } catch (error) {
        console.error('Failed to remove from localStorage:', error);
        return false;
    }
}

/**
 * Get storage usage information
 */
function getStorageInfo() {
    let total = 0;
    let used = 0;
    
    try {
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key) && key.startsWith('songforge-')) {
                used += localStorage[key].length;
            }
        }
        
        // Estimate total available storage (usually ~5-10MB)
        total = 5 * 1024 * 1024; // 5MB estimate
        
        return {
            used: used,
            total: total,
            available: total - used,
            usedPercent: (used / total) * 100
        };
    } catch (error) {
        console.error('Failed to get storage info:', error);
        return null;
    }
}

// =========================================
// MODAL UTILITIES
// =========================================

/**
 * Show modal with custom content
 */
function showModal(title, content, options = {}) {
    const modal = document.getElementById('modalOverlay');
    const modalContent = document.getElementById('modalContent');
    
    if (!modal || !modalContent) {
        console.error('Modal elements not found');
        return;
    }
    
    const closeButton = options.showClose !== false ? `
        <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <i data-lucide="x" class="w-5 h-5"></i>
        </button>
    ` : '';
    
    modalContent.innerHTML = `
        <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">${title}</h3>
            ${closeButton}
        </div>
        <div class="modal-body">
            ${content}
        </div>
    `;
    
    modal.classList.remove('hidden');
    
    // Focus management
    const firstInput = modalContent.querySelector('input, textarea, button, select');
    if (firstInput) {
        setTimeout(() => firstInput.focus(), 100);
    }
    
    // Recreate icons
    lucide.createIcons();
}

/**
 * Close modal
 */
function closeModal() {
    const modal = document.getElementById('modalOverlay');
    if (modal) {
        modal.classList.add('hidden');
    }
}

/**
 * Show confirmation dialog
 */
function showConfirmDialog(message, onConfirm, onCancel = null) {
    const content = `
        <div class="space-y-4">
            <p class="text-gray-700 dark:text-gray-300">${message}</p>
            <div class="flex justify-end space-x-3">
                <button onclick="closeModal(); ${onCancel ? onCancel.toString() + '()' : ''}" 
                        class="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    Cancel
                </button>
                <button onclick="closeModal(); (${onConfirm.toString()})()" 
                        class="px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded-lg transition-colors">
                    Confirm
                </button>
            </div>
        </div>
    `;
    
    showModal('Confirm Action', content, { showClose: false });
}

/**
 * Show input dialog
 */
function showInputDialog(title, placeholder, onSubmit, defaultValue = '') {
    const content = `
        <div class="space-y-4">
            <input type="text" id="dialogInput" placeholder="${placeholder}" value="${defaultValue}"
                   class="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-base">
            <div class="flex justify-end space-x-3">
                <button onclick="closeModal()" 
                        class="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                    Cancel
                </button>
                <button onclick="submitDialogInput(${onSubmit.toString()})" 
                        class="px-4 py-2 bg-primary hover:bg-primary-dark text-white rounded-lg transition-colors">
                    Submit
                </button>
            </div>
        </div>
    `;
    
    showModal(title, content);
}

/**
 * Submit dialog input
 */
function submitDialogInput(callback) {
    const input = document.getElementById('dialogInput');
    if (input && input.value.trim()) {
        callback(input.value.trim());
        closeModal();
    } else {
        showNotification('Please enter a value', 'error');
    }
}

// =========================================
// NOTIFICATION SYSTEM
// =========================================

/**
 * Show notification
 */
function showNotification(message, type = 'info', duration = 3000) {
    if (!window.SongForge.settings.notifications) return;
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="flex items-center justify-between">
            <span>${message}</span>
            <button onclick="this.parentElement.parentElement.remove()" class="ml-4 text-white hover:text-gray-200">
                <i data-lucide="x" class="w-4 h-4"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    lucide.createIcons();
    
    // Auto remove
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, duration);
}

/**
 * Show loading notification
 */
function showLoadingNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification notification-info';
    notification.id = 'loading-notification';
    notification.innerHTML = `
        <div class="flex items-center">
            <div class="spinner mr-3"></div>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    return notification;
}

/**
 * Hide loading notification
 */
function hideLoadingNotification() {
    const notification = document.getElementById('loading-notification');
    if (notification) {
        notification.remove();
    }
}

// =========================================
// FILE UTILITIES
// =========================================

/**
 * Read file as data URL
 */
function readFileAsDataURL(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
    });
}

/**
 * Read file as text
 */
function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
    });
}

/**
 * Download file
 */
function downloadFile(content, filename, mimeType = 'text/plain') {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Validate file type
 */
function validateFileType(file, allowedTypes) {
    const fileType = file.type.toLowerCase();
    return allowedTypes.some(type => fileType.includes(type));
}

/**
 * Format file size
 */
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Compress image file
 */
function compressImage(file, maxWidth = 3000, quality = 0.8) {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();
        
        img.onload = () => {
            const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
            canvas.width = img.width * ratio;
            canvas.height = img.height * ratio;
            
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            
            canvas.toBlob(resolve, 'image/jpeg', quality);
        };
        
        img.src = URL.createObjectURL(file);
    });
}

// =========================================
// VALIDATION UTILITIES
// =========================================

/**
 * Validate email
 */
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

/**
 * Validate URL
 */
function validateURL(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/**
 * Sanitize HTML
 */
function sanitizeHTML(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

/**
 * Validate project title
 */
function validateProjectTitle(title) {
    if (!title || title.trim().length === 0) {
        return { valid: false, message: 'Project title is required' };
    }
    
    if (title.length > 100) {
        return { valid: false, message: 'Project title must be less than 100 characters' };
    }
    
    return { valid: true };
}

// =========================================
// AUDIO UTILITIES
// =========================================

/**
 * Get audio duration
 */
function getAudioDuration(file) {
    return new Promise((resolve) => {
        const audio = new Audio();
        audio.addEventListener('loadedmetadata', () => {
            resolve(audio.duration);
        });
        audio.src = URL.createObjectURL(file);
    });
}

/**
 * Format duration in MM:SS format
 */
function formatDuration(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * Check audio support
 */
function checkAudioSupport() {
    const audio = new Audio();
    return {
        mp3: audio.canPlayType('audio/mpeg') !== '',
        wav: audio.canPlayType('audio/wav') !== '',
        ogg: audio.canPlayType('audio/ogg') !== '',
        webm: audio.canPlayType('audio/webm') !== ''
    };
}

/**
 * Initialize audio context
 */
function initializeAudioContext() {
    try {
        window.SongForge.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        return true;
    } catch (error) {
        console.error('Failed to initialize audio context:', error);
        return false;
    }
}

// =========================================
// GENERAL UTILITIES
// =========================================

/**
 * Generate unique ID
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * Debounce function
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

/**
 * Deep clone object
 */
function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (obj instanceof Array) return obj.map(item => deepClone(item));
    if (typeof obj === 'object') {
        const clonedObj = {};
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                clonedObj[key] = deepClone(obj[key]);
            }
        }
        return clonedObj;
    }
}

/**
 * Format date
 */
function formatDate(date, format = 'short') {
    const options = {
        short: { year: 'numeric', month: 'short', day: 'numeric' },
        long: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' },
        time: { hour: '2-digit', minute: '2-digit' },
        datetime: { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
    };
    
    return new Intl.DateTimeFormat('en-US', options[format] || options.short).format(date);
}

/**
 * Capitalize first letter
 */
function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Truncate text
 */
function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

/**
 * Check if device is mobile
 */
function isMobile() {
    return window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * Check if device supports touch
 */
function supportsTouch() {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
}

/**
 * Get device info
 */
function getDeviceInfo() {
    return {
        isMobile: isMobile(),
        supportsTouch: supportsTouch(),
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        userAgent: navigator.userAgent,
        platform: navigator.platform
    };
}

// =========================================
// KEYBOARD UTILITIES
// =========================================

/**
 * Handle keyboard shortcuts
 */
function handleKeyboardShortcuts(event) {
    // Ctrl/Cmd + S - Save project
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
        event.preventDefault();
        saveProject();
        return;
    }
    
    // Ctrl/Cmd + N - New project
    if ((event.ctrlKey || event.metaKey) && event.key === 'n') {
        event.preventDefault();
        startNewProject();
        return;
    }
    
    // Ctrl/Cmd + E - Export project
    if ((event.ctrlKey || event.metaKey) && event.key === 'e') {
        event.preventDefault();
        exportProject();
        return;
    }
    
    // Escape - Close modal
    if (event.key === 'Escape') {
        closeModal();
        return;
    }
    
    // Space - Play/Pause (when not in input field)
    if (event.key === ' ' && !['INPUT', 'TEXTAREA'].includes(event.target.tagName)) {
        event.preventDefault();
        togglePlayback();
        return;
    }
}

/**
 * Initialize keyboard shortcuts
 */
function initializeKeyboardShortcuts() {
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

// =========================================
// ERROR HANDLING
// =========================================

/**
 * Global error handler
 */
function handleError(error, context = 'Unknown') {
    console.error(`Error in ${context}:`, error);
    
    const errorMessage = error.message || 'An unexpected error occurred';
    showNotification(`Error: ${errorMessage}`, 'error');
    
    // Log error for debugging
    const errorLog = {
        timestamp: new Date().toISOString(),
        context,
        message: errorMessage,
        stack: error.stack,
        userAgent: navigator.userAgent,
        url: window.location.href
    };
    
    console.log('Error log:', errorLog);
}

/**
 * Wrap async functions with error handling
 */
function withErrorHandling(asyncFn, context) {
    return async (...args) => {
        try {
            return await asyncFn(...args);
        } catch (error) {
            handleError(error, context);
            throw error;
        }
    };
}

// Initialize error handling
window.addEventListener('error', (event) => {
    handleError(event.error, 'Global');
});

window.addEventListener('unhandledrejection', (event) => {
    handleError(event.reason, 'Promise Rejection');
});

// =========================================
// INITIALIZATION
// =========================================

/**
 * Initialize all utilities
 */
function initializeUtils() {
    initializeDarkMode();
    initializeKeyboardShortcuts();
    initializeAudioContext();
    updateThemeIcon();
    
    // Set up modal click outside to close
    const modalOverlay = document.getElementById('modalOverlay');
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });
    }
    
    // Initialize theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleDarkMode);
    }
    
    console.log('SongForge utilities initialized');
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeUtils);
} else {
    initializeUtils();
}
