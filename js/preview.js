// HTML Emailer Tool- Email Preview Manager

// Email Preview Manager
class EmailPreview {
    constructor(previewContainer) {
        this.container = previewContainer;
        this.iframe = null;
    }
    
    showTemplate(template) {
        if (!template) {
            this.showEmptyState();
            return;
        }
        
        this.createPreviewIframe();
        this.updatePreview(template);
    }
    
    createPreviewIframe() {
        // Clear existing content
        this.container.innerHTML = '';
        
        // Create preview header
        const header = document.createElement('div');
        header.className = 'preview-header';
        header.innerHTML = `
            <strong>Template Preview:</strong> ${escapeHtml(AppState.selectedTemplate?.name || 'No template selected')}
        `;
        this.container.appendChild(header);
        
        // Create iframe with enhanced security
        this.iframe = document.createElement('iframe');
        this.iframe.className = 'preview-iframe';
        this.iframe.setAttribute('sandbox', 'allow-same-origin');
        this.iframe.setAttribute('loading', 'lazy');
        this.container.appendChild(this.iframe);
    }
    
    updatePreview(template) {
        if (!this.iframe || !template) return;
        
        try {
            // Additional security check before preview
            if (TemplateSanitizer.hasJavaScript(template.content)) {
                this.showErrorState('Template contains JavaScript and cannot be previewed for security reasons.');
                return;
            }
            
            const previewHTML = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; img-src data: https:;">
                    <title>${escapeHtml(template.preview.title)}</title>
                    <style>
                        body { 
                            margin: 0; 
                            font-family: Arial, sans-serif; 
                            background: #f5f5f5;
                        }
                        .preview-warning {
                            background: #fff3cd;
                            border: 1px solid #ffeaa7;
                            color: #856404;
                            padding: 10px;
                            margin: 0;
                            font-size: 12px;
                        }
                    </style>
                </head>
                <body>
                    ${template.warnings.length > 0 ? `
                        <div class="preview-warning">
                            <strong>Warnings:</strong> ${escapeHtml(template.warnings.join(', '))}
                        </div>
                    ` : ''}
                    ${template.preview.content}
                </body>
                </html>
            `;
            
            this.iframe.srcdoc = previewHTML;
        } catch (error) {
            console.error('Failed to update preview:', error);
            this.showError('Failed to preview template');
        }
    }
    
    showEmptyState() {
        this.container.innerHTML = `
            <div class="empty-preview">
                <div class="empty-preview-icon">👀</div>
                <p><strong>No template selected</strong></p>
                <p>Select a template from the left panel to preview</p>
            </div>
        `;
    }
    
    showError(message) {
        this.container.innerHTML = `
            <div class="empty-preview">
                <div class="empty-preview-icon">❌</div>
                <p><strong>Preview Error</strong></p>
                <p>${message}</p>
            </div>
        `;
    }
    
    showErrorState(message) {
        this.container.innerHTML = `
            <div class="empty-preview">
                <div class="empty-preview-icon">🚫</div>
                <p><strong>Security Error</strong></p>
                <p>${escapeHtml(message)}</p>
            </div>
        `;
    }
}
