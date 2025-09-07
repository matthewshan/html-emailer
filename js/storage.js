// HTML Emailer Tool- Template Storage Manager

// Template Storage Manager
class TemplateStorage {
    static saveTemplate(template) {
        try {
            const templates = this.getTemplates();
            templates[template.id] = template;
            localStorage.setItem('email_templates', JSON.stringify(templates));
            return true;
        } catch (error) {
            console.error('Failed to save template:', error);
            return false;
        }
    }
    
    static getTemplates() {
        try {
            const stored = localStorage.getItem('email_templates');
            return stored ? JSON.parse(stored) : {};
        } catch (error) {
            console.error('Failed to load templates:', error);
            return {};
        }
    }
    
    static deleteTemplate(templateId) {
        try {
            const templates = this.getTemplates();
            delete templates[templateId];
            localStorage.setItem('email_templates', JSON.stringify(templates));
            return true;
        } catch (error) {
            console.error('Failed to delete template:', error);
            return false;
        }
    }
    
    static clearAllTemplates() {
        try {
            localStorage.removeItem('email_templates');
            return true;
        } catch (error) {
            console.error('Failed to clear templates:', error);
            return false;
        }
    }
}
