// HTML Emailer Tool- UI Controller

// UI Controller
class UIController {
    static updateTemplateList() {
        const templateList = document.getElementById('template-list');
        
        if (AppState.templates.size === 0) {
            templateList.innerHTML = `
                <div class="empty-preview text-center">
                    <div class="empty-preview-icon">📧</div>
                    <p><strong>No templates loaded</strong></p>
                    <p>Drag HTML email templates above to get started</p>
                </div>
            `;
            return;
        }
        
        const templateCards = Array.from(AppState.templates.values())
            .sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded))
            .map(template => this.createTemplateCard(template))
            .join('');
        
        templateList.innerHTML = templateCards;
        
        // Bind click events
        templateList.querySelectorAll('.template-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const templateId = card.dataset.templateId;
                this.selectTemplate(templateId);
            });
        });
        
        // Bind delete buttons
        templateList.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const templateId = btn.closest('.template-card').dataset.templateId;
                this.deleteTemplate(templateId);
            });
        });
    }
    
    static createTemplateCard(template) {
        const isSelected = AppState.selectedTemplate?.id === template.id;
        
        return `
            <div class="template-card ${isSelected ? 'selected' : ''}" data-template-id="${escapeHtml(template.id)}">
                <div class="template-name">${escapeHtml(template.name)}</div>
                <div class="template-meta">
                    <span>${formatFileSize(template.size)}</span>
                    <span>${formatDate(template.dateAdded)}</span>
                </div>
                ${template.warnings.length > 0 ? `
                    <div class="template-warnings" style="color: #856404; font-size: 11px; margin-top: 4px;">
                        ⚠️ ${template.warnings.length} warning(s)
                    </div>
                ` : ''}
                <div class="template-actions">
                    <button class="btn btn-small btn-secondary">Preview</button>
                    <button class="btn btn-small btn-danger btn-delete">Delete</button>
                </div>
            </div>
        `;
    }
    
    static selectTemplate(templateId) {
        const template = AppState.templates.get(templateId);
        if (!template) return;
        
        AppState.selectedTemplate = template;
        
        // Update UI
        this.updateTemplateList();
        this.updateSendButtonVisibility();
        app.emailPreview.showTemplate(template);
        
        NotificationManager.info(`Selected template: ${template.name}`);
    }
    
    static deleteTemplate(templateId) {
        const template = AppState.templates.get(templateId);
        if (!template) return;
        
        // Safely escape template name for confirmation dialog
        const safeName = template.name.replace(/[<>&"']/g, '');
        if (!confirm(`Are you sure you want to delete "${safeName}"?`)) {
            return;
        }
        
        // Remove from state
        AppState.templates.delete(templateId);
        
        // Remove from storage
        TemplateStorage.deleteTemplate(templateId);
        
        // Clear selection if this template was selected
        if (AppState.selectedTemplate?.id === templateId) {
            AppState.selectedTemplate = null;
            app.emailPreview.showEmptyState();
            this.updateSendButtonVisibility();
        }
        
        // Update UI
        this.updateTemplateList();
        this.updateTemplateCounter();
        
        NotificationManager.success(`Deleted template: ${template.name}`);
    }
    
    static updateTemplateCounter() {
        const counter = document.getElementById('template-counter');
        const count = AppState.templates.size;
        
        if (count === 0) {
            counter.classList.add('hidden');
        } else {
            counter.classList.remove('hidden');
            counter.textContent = `${count} template${count !== 1 ? 's' : ''}`;
        }
    }
    
    static updateSendButtonVisibility() {
        const sendButton = document.getElementById('send-email-button');
        
        if (AppState.selectedTemplate && APIClient.isConfigured()) {
            sendButton.classList.remove('hidden');
        } else {
            sendButton.classList.add('hidden');
        }
    }
}
