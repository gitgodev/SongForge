// =========================================
// BASIC MODAL FUNCTIONS FOR SONGFORGE
// =========================================

/**
 * Show modal dialog
 */
function showModal(title, content, options = {}) {
    const overlay = document.getElementById('modalOverlay');
    const modalContent = document.getElementById('modalContent');
    
    if (!overlay || !modalContent) {
        console.error('Modal elements not found');
        return;
    }
    
    modalContent.innerHTML = `
        <div class="modal-header flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold">${title}</h2>
            <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                <i data-lucide="x" class="w-5 h-5"></i>
            </button>
        </div>
        <div class="modal-body">
            ${content}
        </div>
    `;
    
    overlay.classList.remove('hidden');
    
    // Update icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

/**
 * Close modal dialog
 */
function closeModal() {
    const overlay = document.getElementById('modalOverlay');
    if (overlay) {
        overlay.classList.add('hidden');
    }
}

/**
 * Show notification
 */
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelectorAll('.notification');
    existing.forEach(el => el.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
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

// Make functions globally available
window.showModal = showModal;
window.closeModal = closeModal;
window.showNotification = showNotification;

console.log('Basic modal functions loaded');
