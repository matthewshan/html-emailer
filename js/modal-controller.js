// HTML Emailer Tool - Modal Controller

class ModalController {
    constructor() {
        this.configModal = document.getElementById('config-modal');
        this.sendModal = document.getElementById('send-modal');
        
        this.initializeConfigModal();
        this.initializeSendModal();
    }
    
    // Initialize API Configuration Modal
    initializeConfigModal() {
        const configButton = document.getElementById('config-button');
        const modalClose = document.getElementById('modal-close');
        const testApiButton = document.getElementById('test-api');
        const saveConfigButton = document.getElementById('save-config');
        
        // Form inputs
        const apiKeyInput = document.getElementById('api-key');
        const fromEmailInput = document.getElementById('from-email');
        const fromNameInput = document.getElementById('from-name');
        
        // Load existing configuration
        this.loadAPIConfiguration();
        
        // Event listeners
        configButton.addEventListener('click', () => this.showConfigModal());
        modalClose.addEventListener('click', () => this.hideConfigModal());
        saveConfigButton.addEventListener('click', () => this.saveAPIConfiguration());
        
        // Close modal when clicking outside
        this.configModal.addEventListener('click', (e) => {
            if (e.target === this.configModal) {
                this.hideConfigModal();
            }
        });
        
        // Close modal on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.configModal.classList.contains('hidden')) {
                this.hideConfigModal();
            }
        });
    }
    
    // Initialize Send Email Modal
    initializeSendModal() {
        const sendButton = document.getElementById('send-email-button');
        const sendModalClose = document.getElementById('send-modal-close');
        const cancelSendButton = document.getElementById('cancel-send');
        const confirmSendButton = document.getElementById('confirm-send');
        
        // Event listeners
        sendButton.addEventListener('click', () => this.showSendModal());
        sendModalClose.addEventListener('click', () => this.hideSendModal());
        cancelSendButton.addEventListener('click', () => this.hideSendModal());
        confirmSendButton.addEventListener('click', () => this.sendEmail());
        
        // Close modal when clicking outside
        this.sendModal.addEventListener('click', (e) => {
            if (e.target === this.sendModal) {
                this.hideSendModal();
            }
        });
        
        // Close modal on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.sendModal.classList.contains('hidden')) {
                this.hideSendModal();
            }
        });
    }
    
    // Load API configuration into form
    loadAPIConfiguration() {
        const config = TemplateStorage.getAPIConfig();
        if (config) {
            document.getElementById('api-key').value = config.apiKey || '';
            document.getElementById('from-email').value = config.fromEmail || '';
            document.getElementById('from-name').value = config.fromName || '';
        }
    }
    
    // Show configuration modal
    showConfigModal() {
        this.configModal.classList.remove('hidden');
        document.getElementById('api-key').focus();
    }
    
    // Hide configuration modal
    hideConfigModal() {
        this.configModal.classList.add('hidden');
        this.clearConfigFormErrors();
    }
    
    // Show send email modal
    showSendModal() {
        if (!APIClient.isConfigured()) {
            NotificationManager.warning('Please configure the API settings first');
            this.showConfigModal();
            return;
        }
        
        if (!AppState.selectedTemplate) {
            NotificationManager.warning('Please select a template first');
            return;
        }
        
        // Update template info in modal
        const templateInfo = document.getElementById('selected-template-info');
        templateInfo.textContent = AppState.selectedTemplate.name;
        
        this.sendModal.classList.remove('hidden');
        document.getElementById('to-emails').focus();
    }
    
    // Hide send email modal
    hideSendModal() {
        this.sendModal.classList.add('hidden');
        this.clearSendFormErrors();
    }
    
    // Save API configuration
    async saveAPIConfiguration() {
        const apiKey = document.getElementById('api-key').value.trim();
        const fromEmail = document.getElementById('from-email').value.trim();
        const fromName = document.getElementById('from-name').value.trim();
        const saveButton = document.getElementById('save-config');
        
        if (!apiKey) {
            this.showFieldError('api-key', 'API key is required');
            return;
        }
        
        if (!fromEmail) {
            this.showFieldError('from-email', 'From email is required');
            return;
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(fromEmail)) {
            this.showFieldError('from-email', 'Please enter a valid email address');
            return;
        }
        
        try {
            this.clearConfigFormErrors();
            saveButton.textContent = 'Saving...';
            saveButton.disabled = true;
            
            APIClient.saveConfiguration(apiKey, fromEmail, fromName);
            
            this.hideConfigModal();
            NotificationManager.success('API configuration saved successfully');
            UIController.updateSendButtonVisibility();
            
        } catch (error) {
            this.showFieldError('api-key', error.message);
            NotificationManager.error(`Failed to save configuration: ${error.message}`);
        } finally {
            saveButton.textContent = 'Save Configuration';
            saveButton.disabled = false;
        }
    }
    
    // Send email
    async sendEmail() {
        const toEmailsText = document.getElementById('to-emails').value.trim();
        const subject = document.getElementById('email-subject').value.trim();
        const confirmButton = document.getElementById('confirm-send');
        
        if (!toEmailsText) {
            this.showFieldError('to-emails', 'At least one recipient is required');
            return;
        }
        
        if (!subject) {
            this.showFieldError('email-subject', 'Subject is required');
            return;
        }
        
        // Parse email addresses
        const emailList = toEmailsText.split('\n').map(email => email.trim()).filter(email => email);
        const emailValidation = ResendAPIClient.validateEmails(emailList);
        
        if (!emailValidation.isValid) {
            this.showFieldError('to-emails', `Invalid email addresses: ${emailValidation.invalid.join(', ')}`);
            return;
        }
        
        if (emailValidation.valid.length === 0) {
            this.showFieldError('to-emails', 'No valid email addresses found');
            return;
        }
        
        try {
            this.clearSendFormErrors();
            confirmButton.textContent = 'Sending...';
            confirmButton.disabled = true;
            
            // Get selected template content
            const templateContent = AppState.selectedTemplate.content;
            const templateName = AppState.selectedTemplate.name;
            
            // Send email
            const result = await APIClient.sendEmail(
                emailValidation.valid,
                subject,
                templateContent,
                templateName
            );
            
            // Save to send history
            const sendRecord = {
                id: generateId(),
                templateName: templateName,
                subject: subject,
                recipients: emailValidation.valid,
                sentAt: result.sentAt,
                emailId: result.emailId
            };
            TemplateStorage.saveSendHistory(sendRecord);
            
            this.hideSendModal();
            NotificationManager.success(`Email sent successfully to ${emailValidation.valid.length} recipient(s)`);
            
            // Clear form
            document.getElementById('to-emails').value = '';
            document.getElementById('email-subject').value = '';
            
        } catch (error) {
            this.showFieldError('to-emails', error.message);
            NotificationManager.error(`Failed to send email: ${error.message}`);
        } finally {
            confirmButton.textContent = 'Send Email';
            confirmButton.disabled = false;
        }
    }
    
    // Show field error
    showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const existingError = field.parentNode.querySelector('.error-message');
        
        if (existingError) {
            existingError.remove();
        }
        
        field.classList.add('error');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        field.parentNode.appendChild(errorDiv);
    }
    
    // Show success message
    showSuccessMessage(fieldId, message) {
        const field = document.getElementById(fieldId);
        const existingMessage = field.parentNode.querySelector('.success-message');
        
        if (existingMessage) {
            existingMessage.remove();
        }
        
        field.classList.remove('error');
        
        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        field.parentNode.appendChild(successDiv);
        
        // Remove success message after 3 seconds
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.remove();
            }
        }, 3000);
    }
    
    // Clear configuration form errors
    clearConfigFormErrors() {
        const fields = ['api-key', 'from-email', 'from-name'];
        fields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            field.classList.remove('error');
            const errorMsg = field.parentNode.querySelector('.error-message');
            const successMsg = field.parentNode.querySelector('.success-message');
            if (errorMsg) errorMsg.remove();
            if (successMsg) successMsg.remove();
        });
    }
    
    // Clear send form errors
    clearSendFormErrors() {
        const fields = ['to-emails', 'email-subject'];
        fields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            field.classList.remove('error');
            const errorMsg = field.parentNode.querySelector('.error-message');
            if (errorMsg) errorMsg.remove();
        });
    }
}

// Global modal controller instance
const modalController = new ModalController();
