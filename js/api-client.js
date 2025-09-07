// HTML Emailer Tool - Resend API Client

class ResendAPIClient {
    constructor() {
        this.baseURL = window.location.origin;
        this.apiKey = null;
        this.fromEmail = null;
        this.fromName = null;
        
        this.loadConfiguration();
    }
    
    // Load configuration from localStorage
    loadConfiguration() {
        try {
            const config = TemplateStorage.getAPIConfig();
            if (config) {
                this.fromEmail = config.fromEmail;
                this.fromName = config.fromName;
                // API key is never loaded from storage
            }
        } catch (error) {
            console.warn('Failed to load Sender Info:', error);
        }
    }
    
    // Save configuration to localStorage
    saveConfiguration(fromEmail, fromName = '') {
        try {
            const config = {
                fromEmail: fromEmail,
                fromName: fromName,
                savedAt: new Date().toISOString()
            };
            
            TemplateStorage.saveAPIConfig(config);
            
            // Update instance variables (but don't store API key)
            this.fromEmail = fromEmail;
            this.fromName = fromName;
            
            return true;
        } catch (error) {
            console.error('Failed to save Sender Info:', error);
            throw new Error('Failed to save configuration');
        }
    }
    
    // Send email
    async sendEmail(toEmails, subject, htmlContent, templateName = null, apiKey = null) {
        // Use provided API key or fall back to stored one
        const effectiveApiKey = apiKey || this.apiKey;
        
        if (!effectiveApiKey) {
            throw new Error('API key is required');
        }
        
        if (!this.fromEmail) {
            throw new Error('From email is not configured');
        }
        
        if (!toEmails || toEmails.length === 0) {
            throw new Error('At least one recipient is required');
        }
        
        if (!subject || subject.trim() === '') {
            throw new Error('Email subject is required');
        }
        
        if (!htmlContent || htmlContent.trim() === '') {
            throw new Error('Email content is required');
        }
        
        // Validate HTML content for JavaScript
        if (TemplateSanitizer.hasJavaScript(htmlContent)) {
            throw new Error('Email content contains JavaScript which is not allowed for security reasons');
        }
        
        // Prepare from field
        const fromField = this.fromName 
            ? `${this.fromName} <${this.fromEmail}>`
            : this.fromEmail;
        
        // Prepare email payload
        const emailData = {
            from: fromField,
            to: toEmails,
            subject: subject,
            html: htmlContent
        };
        
        // Add optional template reference in headers
        if (templateName) {
            emailData.headers = {
                'X-Template-Name': templateName
            };
        }
        
        try {
            const response = await fetch(`${this.baseURL}/api/send-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    apiKey: effectiveApiKey,
                    emailData: emailData
                })
            });
            
            const responseData = await response.json();
            
            if (!response.ok) {
                // Handle specific API errors
                if (response.status === 401) {
                    throw new Error('Invalid API key');
                } else if (response.status === 403) {
                    throw new Error('API key does not have required permissions');
                } else if (response.status === 422) {
                    // Validation errors
                    const errorMessage = responseData.message || 'Validation error';
                    throw new Error(`Validation error: ${errorMessage}`);
                } else if (response.status === 429) {
                    throw new Error('Rate limit exceeded. Please try again later.');
                } else {
                    const errorMessage = responseData.message || `API error: ${response.status}`;
                    throw new Error(errorMessage);
                }
            }
            
            return {
                success: true,
                emailId: responseData.id,
                message: `Email sent successfully to ${toEmails.length} recipient(s)`,
                recipients: toEmails,
                sentAt: new Date().toISOString()
            };
            
        } catch (error) {
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Network error: Unable to connect to Resend API');
            }
            throw error;
        }
    }
    
    // Validate email addresses
    static validateEmails(emailList) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const invalidEmails = [];
        const validEmails = [];
        
        emailList.forEach(email => {
            const trimmedEmail = email.trim();
            if (trimmedEmail === '') {
                return; // Skip empty lines
            }
            
            if (emailRegex.test(trimmedEmail)) {
                validEmails.push(trimmedEmail);
            } else {
                invalidEmails.push(trimmedEmail);
            }
        });
        
        return {
            valid: validEmails,
            invalid: invalidEmails,
            isValid: invalidEmails.length === 0
        };
    }
    
    // Check if API is configured
    isConfigured() {
        return !!this.fromEmail;
    }
    
    // Clear configuration
    clearConfiguration() {
        try {
            TemplateStorage.clearAPIConfig();
            this.apiKey = null;
            this.fromEmail = null;
            this.fromName = null;
            return true;
        } catch (error) {
            console.error('Failed to clear Sender Information:', error);
            return false;
        }
    }
}

// Global API client instance
const APIClient = new ResendAPIClient();
