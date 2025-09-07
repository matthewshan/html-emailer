// HTML Emailer Tool- Main Application

// Main Application Class
class EmailerApp {
    constructor() {
        this.dropZoneManager = null;
        this.emailPreview = null;
        
        this.initializeApp();
    }
    
    clearStoredAPIKeys() {
        // Remove any stored API keys for security
        try {
            const config = TemplateStorage.getAPIConfig();
            if (config && config.apiKey) {
                delete config.apiKey;
                TemplateStorage.saveAPIConfig(config);
                console.log('Cleared stored API key for security');
            }
        } catch (error) {
            console.warn('Failed to clear stored API keys:', error);
        }
    }
    
    initializeApp() {
        // Clear any stored API keys for security
        this.clearStoredAPIKeys();
        
        // Initialize drop zone
        const dropZone = document.getElementById('drop-zone');
        const fileInput = document.getElementById('file-input');
        this.dropZoneManager = new DropZoneManager(dropZone, fileInput);
        
        // Initialize email preview
        const previewContainer = document.getElementById('preview-container');
        this.emailPreview = new EmailPreview(previewContainer);
        
        // Load saved templates
        this.loadSavedTemplates();
        
        // Bind event listeners
        this.bindEventListeners();
        
        // Update initial UI state
        UIController.updateTemplateCounter();
        UIController.updateSendButtonVisibility();
        
        // Show welcome message
        setTimeout(() => {
            NotificationManager.info('Welcome to HTML Email Tool!');
        }, 1000);
    }
    
    loadSavedTemplates() {
        try {
            const savedTemplates = TemplateStorage.getTemplates();
            
            Object.values(savedTemplates).forEach(template => {
                AppState.templates.set(template.id, template);
            });
            
            if (AppState.templates.size > 0) {
                UIController.updateTemplateList();
                UIController.updateTemplateCounter();
                UIController.updateSendButtonVisibility();
                NotificationManager.success(`Loaded ${AppState.templates.size} saved template(s)`);
            }
        } catch (error) {
            console.error('Failed to load saved templates:', error);
            NotificationManager.error('Failed to load saved templates');
        }
    }
    
    bindEventListeners() {
       
        // Global error handling
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            NotificationManager.error('An unexpected error occurred');
        });
    }
}

// Initialize Application
let app;document.addEventListener('DOMContentLoaded', () => {
    app = new EmailerApp();
});

// Global error handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    NotificationManager.error('An error occurred while processing your request');
});
