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
    
    // API Configuration Storage
    static saveAPIConfig(config) {
        try {
            localStorage.setItem('email_api_config', JSON.stringify(config));
            return true;
        } catch (error) {
            console.error('Failed to save API configuration:', error);
            return false;
        }
    }
    
    static getAPIConfig() {
        try {
            const stored = localStorage.getItem('email_api_config');
            return stored ? JSON.parse(stored) : null;
        } catch (error) {
            console.error('Failed to load API configuration:', error);
            return null;
        }
    }
    
    static clearAPIConfig() {
        try {
            localStorage.removeItem('email_api_config');
            return true;
        } catch (error) {
            console.error('Failed to clear API configuration:', error);
            return false;
        }
    }
    
    // Email Send History Storage
    static saveSendHistory(sendRecord) {
        try {
            const history = this.getSendHistory();
            history.unshift(sendRecord); // Add to beginning
            
            // Keep only last 100 records
            if (history.length > 100) {
                history.splice(100);
            }
            
            localStorage.setItem('email_send_history', JSON.stringify(history));
            return true;
        } catch (error) {
            console.error('Failed to save send history:', error);
            return false;
        }
    }
    
    static getSendHistory() {
        try {
            const stored = localStorage.getItem('email_send_history');
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Failed to load send history:', error);
            return [];
        }
    }
    
    static clearSendHistory() {
        try {
            localStorage.removeItem('email_send_history');
            return true;
        } catch (error) {
            console.error('Failed to clear send history:', error);
            return false;
        }
    }
}
