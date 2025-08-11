// =========================================
// SAFE IMPORT FUNCTIONALITY FOR SONGFORGE
// =========================================

/**
 * Enhanced import functionality
 */
function setupEnhancedImportListeners() {
    console.log('Setting up import listeners...');
    
    // Dashboard import
    const dashboardImportBtn = document.getElementById('importProjectBtn');
    const projectImportInput = document.getElementById('projectImportInput');
    
    if (dashboardImportBtn && projectImportInput) {
        dashboardImportBtn.addEventListener('click', (e) => {
            e.preventDefault();
            projectImportInput.click();
        });
        
        projectImportInput.addEventListener('change', handleEnhancedProjectImport);
        console.log('Dashboard import listeners added');
    }
    
    // Project interface import
    const importInput = document.getElementById('importInput');
    if (importInput) {
        importInput.addEventListener('change', handleEnhancedProjectImport);
        console.log('Project interface import listener added');
    }
}

/**
 * Trigger import dialog
 */
function triggerImport() {
    const importInput = document.getElementById('projectImportInput') || document.getElementById('importInput');
    if (importInput) {
        importInput.click();
    } else {
        showNotification('Import functionality not available', 'error');
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
    
    // Show loading
    showNotification('Importing project...', 'info');
    
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const projectData = JSON.parse(e.target.result);
            
            // Simple validation
            if (!projectData || typeof projectData !== 'object') {
                throw new Error('Invalid project file format');
            }
            
            // Add defaults
            projectData.id = projectData.id || 'imported-' + Date.now();
            projectData.title = projectData.title || 'Imported Project';
            
            showNotification('Project imported successfully!', 'success');
            console.log('Project imported:', projectData);
            
        } catch (error) {
            console.error('Import error:', error);
            showNotification('Failed to import project: ' + error.message, 'error');
        }
    };
    
    reader.onerror = () => {
        showNotification('Failed to read file', 'error');
    };
    
    reader.readAsText(file);
    
    // Reset input
    event.target.value = '';
}

/**
 * Initialize import system safely
 */
function initializeEnhancedImport() {
    try {
        console.log('Initializing enhanced import...');
        setupEnhancedImportListeners();
        
        // Add keyboard shortcut for import (Ctrl+O)
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
                e.preventDefault();
                triggerImport();
            }
        });
        
        console.log('Enhanced import system initialized successfully');
        
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

console.log('Safe import fix loaded');
