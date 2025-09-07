// HTML Emailer Tool- Main Application

// Main Application Class
class EmailerApp {
    constructor() {
        this.dropZoneManager = null;
        this.emailPreview = null;
        
        this.initializeApp();
    }
    
    initializeApp() {
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
        // Configuration button
        document.getElementById('config-button').addEventListener('click', () => {
            NotificationManager.info('Configuration panel coming in Phase 2!');
        });
        
        // Help button
        document.getElementById('help-button').addEventListener('click', () => {
            this.showHelp();
        });
        
        // Global error handling
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            NotificationManager.error('An unexpected error occurred');
        });
    }
    
    showHelp() {
        const helpMessage = `
HTML Emailer Tool- Phase 1

How to use:
1. Drag & drop HTML email template files into the drop zone
2. Click on a template card to select and preview it
3. Use the preview panel to see how your email will look

Features in this version:
✅ Drag & drop template loading
✅ Template storage and management
✅ Email preview
✅ Template validation and sanitization

Coming in future phases:
📧 Email composition and sending
⚙️ API configuration
📊 Batch email management
        `.trim();
        
        alert(helpMessage);
    }
}

// Initialize Application
let app;

document.addEventListener('DOMContentLoaded', () => {
    app = new EmailerApp();
});

// Global error handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    NotificationManager.error('An error occurred while processing your request');
});
