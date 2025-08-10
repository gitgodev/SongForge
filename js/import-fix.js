// =========================================
// IMPORT FUNCTIONALITY FIX FOR SONGFORGE
// =========================================

/**
 * Enhanced import functionality
 */
function setupEnhancedImportListeners() {
    // Dashboard import
    const dashboardImportBtn = document.getElementById('importProjectBtn');
    const projectImportInput = document.getElementById('projectImportInput');
    
    if (dashboardImportBtn && projectImportInput) {
        dashboardImportBtn.addEventListener('click', (e) => {
            e.preventDefault();
            projectImportInput.click();
        });
        
        projectImportInput.addEventListener('change', handleEnhancedProjectImport);
    }
    
    // Project interface import
    const importInput = document.getElementById('importInput');
    if (importInput) {
        importInput.addEventListener('change', handleEnhancedProjectImport);
    }
    
    // Quick import buttons
    const quickImportBtns = document.querySelectorAll('.quick-import-btn');
    quickImportBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            triggerImport();
        });
    });
}

/**
 * Trigger import dialog
 */
function triggerImport() {
    const importInput = document.getElementById('projectImportInput') || document.getElementById('importInput');
    if (importInput) {
        importInput.click();
    } else {
        // Create temporary input
        const tempInput = document.createElement('input');
        tempInput.type = 'file';
        tempInput.accept = '.json';
        tempInput.style.display = 'none';
        document.body.appendChild(tempInput);
        
        tempInput.addEventListener('change', handleEnhancedProjectImport);
        tempInput.click();
        
        // Clean up after use
        setTimeout(() => {
            if (tempInput.parentNode) {
                tempInput.parentNode.removeChild(tempInput);
            }
        }, 1000);
    }
}

/**
 * Enhanced project import handler
 */
function handleEnhancedProjectImport(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Validate file type
    if (!file.type.includes('json') && !file.name.endsWith('.json')) {
        showSafeNotification('Please select a valid JSON project file', 'error');
        return;
    }
    
    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
        showSafeNotification('File size must be less than 10MB', 'error');
        return;
    }
    
    // Show loading
    showLoadingNotification('Importing project...');
    
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const projectData = JSON.parse(e.target.result);
            
            // Validate project structure
            if (!validateProjectStructure(projectData)) {
                throw new Error('Invalid project file format');
            }
            
            // Import the project
            importProjectData(projectData);
            
            hideLoadingNotification();
            showSafeNotification('Project imported successfully!', 'success');
            
        } catch (error) {
            console.error('Import error:', error);
            hideLoadingNotification();
            showSafeNotification(`Failed to import project: ${error.message}`, 'error');
        }
    };
    
    reader.onerror = () => {
        hideLoadingNotification();
        showSafeNotification('Failed to read file', 'error');
    };
    
    reader.readAsText(file);
    
    // Reset input
    event.target.value = '';
}

/**
 * Validate project structure
 */
function validateProjectStructure(projectData) {
    // Basic validation
    if (!projectData || typeof projectData !== 'object') {
        return false;
    }
    
    // Check for required fields
    const requiredFields = ['id', 'title'];
    for (const field of requiredFields) {
        if (!(field in projectData)) {
            console.warn(`Missing required field: ${field}`);
            // Don't fail for missing fields, just add defaults
            if (field === 'id') {
                projectData.id = generateId();
            }
        }
    }
    
    // Ensure arrays exist
    const arrayFields = ['lyrics', 'workflow', 'release', 'recordings'];
    arrayFields.forEach(field => {
        if (!Array.isArray(projectData[field])) {
            projectData[field] = [];
        }
    });
    
    // Add missing metadata
    if (!projectData.createdDate) {
        projectData.createdDate = new Date().toLocaleDateString();
    }
    if (!projectData.modifiedDate) {
        projectData.modifiedDate = new Date().toLocaleDateString();
    }
    if (!projectData.version) {
        projectData.version = '2.0';
    }
    
    return true;
}

/**
 * Import project data
 */
function importProjectData(projectData) {
    // Update current project
    window.SongForge.app.currentProject = projectData;
    
    // Update project history
    if (typeof saveToHistory === 'function') {
        saveToHistory(projectData);
    }
    
    // Update UI
    if (typeof updateProjectUI === 'function') {
        updateProjectUI();
    }
    
    // Save to user's projects if logged in
    if (window.SongForge.auth.isLoggedIn && typeof saveProjectForUser === 'function') {
        saveProjectForUser(projectData);
    }
    
    // Save to local storage
    if (typeof saveToStorage === 'function') {
        saveToStorage('current-project', projectData);
    }
    
    // Switch to project interface
    if (typeof showProjectInterface === 'function') {
        showProjectInterface();
    } else {
        // Fallback to manual screen switch
        hideAllScreens();
        const projectInterface = document.getElementById('projectInterface');
        if (projectInterface) {
            projectInterface.classList.remove('hidden');
            window.SongForge.app.currentScreen = 'project';
        }
    }
    
    // Update lyrics if available
    if (projectData.lyrics && window.SongForge.lyricsEnhanced) {
        window.SongForge.lyricsEnhanced.sections = projectData.lyrics;
    }
    
    // Refresh icons
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

/**
 * Show loading notification
 */
function showLoadingNotification(message) {
    const existing = document.querySelector('.loading-notification');
    if (existing) existing.remove();
    
    const notification = document.createElement('div');
    notification.className = 'loading-notification fixed top-4 right-4 z-50 bg-blue-500 text-white p-4 rounded-lg shadow-lg flex items-center space-x-3';
    notification.innerHTML = `
        <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
}

/**
 * Hide loading notification
 */
function hideLoadingNotification() {
    const notification = document.querySelector('.loading-notification');
    if (notification) {
        notification.remove();
    }
}

/**
 * Enhanced export with better formatting
 */
function exportProjectWithMetadata() {
    if (!window.SongForge.app.currentProject) {
        showSafeNotification('No project to export', 'error');
        return;
    }
    
    const project = window.SongForge.app.currentProject;
    
    // Add export metadata
    const exportData = {
        ...project,
        exportInfo: {
            exportedAt: new Date().toISOString(),
            exportedBy: window.SongForge.auth.currentUser?.username || 'Guest',
            appVersion: '2.0',
            format: 'SongForge Project'
        }
    };
    
    const filename = (project.title || 'songforge-project').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const jsonString = JSON.stringify(exportData, null, 2);
    
    downloadFile(jsonString, `${filename}.json`, 'application/json');
    showSafeNotification('Project exported successfully', 'success');
}

/**
 * Add import button to navigation
 */
function addImportToNavigation() {
    // Add import option to user dropdown if it doesn't exist
    const userDropdown = document.getElementById('userDropdown');
    if (userDropdown && !userDropdown.querySelector('.import-project-nav')) {
        const importButton = document.createElement('button');
        importButton.className = 'import-project-nav w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors';
        importButton.innerHTML = '<i data-lucide="upload" class="w-4 h-4 mr-2 inline"></i>Import Project';
        importButton.addEventListener('click', triggerImport);
        
        // Add before logout button or at the end
        const logoutBtn = userDropdown.querySelector('#logoutBtn');
        if (logoutBtn) {
            userDropdown.insertBefore(importButton, logoutBtn);
        } else {
            userDropdown.querySelector('.py-1').appendChild(importButton);
        }
        
        // Update icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
    }
}

/**
 * Initialize enhanced import system
 */
function initializeEnhancedImport() {
    setupEnhancedImportListeners();
    addImportToNavigation();
    
    // Add keyboard shortcut for import (Ctrl+O)
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
            e.preventDefault();
            triggerImport();
        }
    });
    
    console.log('Enhanced import system initialized');
}

// Auto-initialize when this script loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeEnhancedImport);
} else {
    initializeEnhancedImport();
}

// Make functions globally available
window.triggerImport = triggerImport;
window.exportProjectWithMetadata = exportProjectWithMetadata;
window.importProjectData = importProjectData;

console.log('Import fix loaded');
