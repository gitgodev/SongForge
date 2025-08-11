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
    
    console.log('Enhanced import listeners set up');
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
        showNotification('Please select a valid JSON project file', 'error');
        return;
    }
    
    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
        showNotification('File size must be less than 10MB', 'error');
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
            showNotification('Project imported successfully!', 'success');
            
        } catch (error) {
            console.error('Import error:', error);
            hideLoadingNotification();
            showNotification(`Failed to import project: ${error.message}`, 'error');
        }
    };
    
    reader.onerror = () => {
        hideLoadingNotification();
        showNotification('Failed to read file', 'error');
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
    
    // Check for required fields and add defaults if missing
    if (!projectData.id) {
        projectData.id = 'imported-' + Date.now().toString(36);
    }
    
    if (!projectData.title) {
        projectData.title = 'Imported Project';
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
    try {
        // Update current project
        window.SongForge = window.SongForge || {};
        window.SongForge.app = window.SongForge.app || {};
        window.SongForge.app.currentProject = projectData;
        
        // Update lyrics if available
        if (projectData.lyrics && window.SongForge.lyricsEnhanced) {
            window.SongForge.lyricsEnhanced.sections = projectData.lyrics;
        }
        
        // Switch to project interface
        hideAllScreens();
        const projectInterface = document.getElementById('projectInterface');
        if (projectInterface) {
            projectInterface.classList.remove('hidden');
            
            // Update project UI
            const titleInput = document.getElementById('projectTitle');
            if (titleInput) {
                titleInput.value = projectData.title || 'Imported Project';
            }
            
            const artistInput = document.getElementById('artistName');
            if (artistInput) {
                artistInput.value = projectData.artist || '';
            }
            
            const genreInput = document.getElementById('genre');
            if (genreInput) {
                genreInput.value = projectData.genre || '';
            }
            
            const bpmInput = document.getElementById('bpm');
            if (bpmInput) {
                bpmInput.value = projectData.bpm || '';
            }
            
            const keyInput = document.getElementById('key');
            if (keyInput) {
                keyInput.value = projectData.key || '';
            }
            
            const projectDate = document.getElementById('projectDate');
            if (projectDate) {
                projectDate.textContent = projectData.createdDate || new Date().toLocaleDateString();
            }
        }
        
        // Refresh icons
        if (typeof lucide !== 'undefined') {
            lucide.createIcons();
        }
        
        console.log('Project imported successfully:', projectData.title);
        
    } catch (error) {
        console.error('Error importing project data:', error);
        showNotification('Error setting up imported project', 'error');
    }
}

/**
 * Hide all screens utility
 */
function hideAllScreens() {
    const screens = ['welcomeScreen', 'dashboardScreen', 'projectInterface', 'freestyleMode'];
    screens.forEach(id => {
        const screen = document.getElementById(id);
        if (screen) screen.classList.add('hidden');
    });
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
    if (!window.SongForge || !window.SongForge.app || !window.SongForge.app.currentProject) {
        showNotification('No project to export', 'error');
        return;
    }
    
    const project = window.SongForge.app.currentProject;
    
    // Add export metadata
    const exportData = {
        ...project,
        exportInfo: {
            exportedAt: new Date().toISOString(),
            exportedBy: 'SongForge User',
            appVersion: '2.0',
            format: 'SongForge Project'
        }
    };
    
    const filename = (project.title || 'songforge-project').replace(/[^a-z0-9]/gi, '_').toLowerCase();
    const jsonString = JSON.stringify(exportData, null, 2);
    
    // Create download
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Project exported successfully', 'success');
}

/**
 * Enhanced file drop zone functionality
 */
function setupDropZone() {
    // Add drop zone to dashboard
    const dashboardScreen = document.getElementById('dashboardScreen');
    if (dashboardScreen) {
        dashboardScreen.addEventListener('dragover', (e) => {
            e.preventDefault();
            dashboardScreen.style.backgroundColor = 'rgba(30, 144, 255, 0.1)';
        });
        
        dashboardScreen.addEventListener('dragleave', (e) => {
            e.preventDefault();
            if (!dashboardScreen.contains(e.relatedTarget)) {
                dashboardScreen.style.backgroundColor = '';
            }
        });
        
        dashboardScreen.addEventListener('drop', (e) => {
            e.preventDefault();
            dashboardScreen.style.backgroundColor = '';
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                const file = files[0];
                if (file.type.includes('json') || file.name.endsWith('.json')) {
                    // Create fake event for the handler
                    const fakeEvent = { target: { files: [file], value: '' } };
                    handleEnhancedProjectImport(fakeEvent);
                } else {
                    showNotification('Please drop a JSON project file', 'error');
                }
            }
        });
    }
}

/**
 * Initialize enhanced import system
 */
function initializeEnhancedImport() {
    try {
        setupEnhancedImportListeners();
        setupDropZone();
        
        // Add keyboard shortcut for import (Ctrl+O)
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
                e.preventDefault();
                triggerImport();
            }
            
            // Add keyboard shortcut for export (Ctrl+E)
            if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
                e.preventDefault();
                exportProjectWithMetadata();
            }
        });
        
        console.log('Enhanced import system initialized');
        
    } catch (error) {
        console.error('Error initializing enhanced import:', error);
    }
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

console.log('Import fix loaded (safe version)');
