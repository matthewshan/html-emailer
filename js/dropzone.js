// HTML Emailer Tool- Drop Zone Manager

// Drop Zone Manager
class DropZoneManager {
    constructor(dropZoneElement, fileInputElement) {
        this.dropZone = dropZoneElement;
        this.fileInput = fileInputElement;
        this.initializeDropZone();
    }
    
    initializeDropZone() {
        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            this.dropZone.addEventListener(eventName, this.preventDefaults, false);
            document.body.addEventListener(eventName, this.preventDefaults, false);
        });
        
        // Visual feedback for drag operations
        ['dragenter', 'dragover'].forEach(eventName => {
            this.dropZone.addEventListener(eventName, this.highlightDropZone.bind(this), false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            this.dropZone.addEventListener(eventName, this.unhighlightDropZone.bind(this), false);
        });
        
        // Handle file drops
        this.dropZone.addEventListener('drop', this.handleDrop.bind(this), false);
        
        // Handle file input change
        this.fileInput.addEventListener('change', this.handleFileSelect.bind(this), false);
        
        // Handle click to open file dialog
        this.dropZone.addEventListener('click', () => {
            this.fileInput.click();
        });
    }
    
    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    highlightDropZone() {
        this.dropZone.classList.add('drag-over');
    }
    
    unhighlightDropZone() {
        this.dropZone.classList.remove('drag-over');
    }
    
    async handleDrop(e) {
        const dt = e.dataTransfer;
        const files = Array.from(dt.files);
        
        // Pre-filter files by extension before processing
        const nonHTMLFiles = files.filter(file => !file.name.toLowerCase().endsWith('.html'));
        if (nonHTMLFiles.length > 0) {
            NotificationManager.warning(`Skipping ${nonHTMLFiles.length} non-HTML file(s). Only .html files are accepted.`);
        }
        
        const htmlFiles = files.filter(file => file.name.toLowerCase().endsWith('.html'));
        if (htmlFiles.length > 0) {
            await this.processFiles(htmlFiles);
        }
    }
    
    async handleFileSelect(e) {
        const files = Array.from(e.target.files);
        await this.processFiles(files);
        // Clear the input so the same file can be selected again
        e.target.value = '';
    }
    
    async processFiles(files) {
        // Filter for HTML files only - check both MIME type and extension
        const htmlFiles = files.filter(file => {
            const isHTMLMime = file.type === 'text/html' || file.type === '';
            const isHTMLExtension = file.name.toLowerCase().endsWith('.html');
            return isHTMLMime && isHTMLExtension;
        });
        
        if (htmlFiles.length === 0) {
            NotificationManager.warning('Please select HTML files only (.html extension required)');
            return;
        }
        
        if (htmlFiles.length > 10) {
            NotificationManager.warning('Maximum 10 files can be processed at once');
            return;
        }
        
        AppState.isLoading = true;
        
        let successCount = 0;
        let errorCount = 0;
        
        for (const file of htmlFiles) {
            try {
                await this.processTemplate(file);
                successCount++;
            } catch (error) {
                console.error('Failed to process template:', file.name, error);
                
                // Show specific error reason for each failed file
                const fileName = file.name.replace(/[<>&"']/g, ''); // Sanitize filename for display
                NotificationManager.error(`${fileName}: ${error.message}`);
                
                errorCount++;
            }
        }
        
        AppState.isLoading = false;
        
        if (successCount > 0) {
            NotificationManager.success(`Successfully loaded ${successCount} template(s)`);
            UIController.updateTemplateList();
            UIController.updateTemplateCounter();
        }
        
        // Individual error messages are now shown for each failed file
        // No need for a generic error count message
    }
    
    async processTemplate(file) {
        try {
            // Validate file size first (before reading content)
            if (file.size > 1024 * 1024) {
                throw new Error('File too large (maximum 1MB allowed)');
            }
            
            // Validate filename for security
            const filenameValidation = TemplateSanitizer.validateFileName(file.name);
            if (!filenameValidation.isValid) {
                throw new Error(filenameValidation.reason);
            }
            
            const content = await file.text();
            
            // Validate and sanitize content
            const validation = TemplateSanitizer.validateTemplate(content);
            if (!validation.isValid) {
                const errorMsg = validation.error || 'Invalid HTML template structure';
                throw new Error(errorMsg);
            }
            
            const preview = TemplateSanitizer.generatePreview(content);
            
            const template = {
                id: generateId(),
                name: file.name,
                content: content,
                size: file.size,
                dateAdded: new Date().toISOString(),
                preview: preview,
                warnings: validation.warnings
            };
            
            // Check for duplicate names
            const existingTemplate = Array.from(AppState.templates.values())
                .find(t => t.name === template.name);
            
            if (existingTemplate) {
                const safeName = template.name.replace(/[<>&"']/g, '');
                const confirmReplace = confirm(`Template "${safeName}" already exists. Replace it?`);
                if (confirmReplace) {
                    AppState.templates.delete(existingTemplate.id);
                    TemplateStorage.deleteTemplate(existingTemplate.id);
                } else {
                    template.name = `${file.name} (${Date.now()})`;
                }
            }
            
            // Add to application state
            AppState.templates.set(template.id, template);
            
            // Save to localStorage
            if (!TemplateStorage.saveTemplate(template)) {
                throw new Error('Failed to save template');
            }
            
            return template;
        } catch (error) {
            throw new Error(`Failed to process ${file.name}: ${error.message}`);
        }
    }
}
