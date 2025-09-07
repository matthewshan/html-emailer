# Email Campaign Tool - Technical Specification

## Document Information
- **Project**: Email Campaign Tool
- **Architecture**: Single HTML File with Drag & Drop Template Loading
- **Created**: September 6, 2025
- **Version**: 1.0
- **Status**: Ready for Implementation

## Executive Summary

This technical specification outlines the implementation of a single HTML file email campaign tool. The solution provides a zero-dependency, browser-based application that enables users to send professional HTML emails using the Resend API through an intuitive drag-and-drop interface.

## Architecture Overview

### Core Architecture: Self-Contained HTML Application

```
index.html (Complete Application ~150-200KB)
├── Embedded HTML Structure
├── Em### Maintenance Specifications

### Update Process
1. Modify source files in repository
2. Create GitHub release with version tag
3. GitHub Actions automatically bundles and publishes release assets
4. Users download updated ZIP package from GitHub releases

### Automated Deployment
GitHub Actions workflow will:
- Trigger on release creation
- Bundle required files (HTML, CSS, JS, templates, docs)
- Create ZIP package for distribution
- Attach ZIP to release as downloadable asset

### Monitoring
- User feedback collection via GitHub issues
- API error rate tracking
- Performance metrics collectionyling
├── Embedded JavaScript Logic
├── Drag & Drop Template Handling
├── Resend API Integration
├── LocalStorage Data Management
└── Browser-Based Email Preview
```

### Key Design Principles

1. **Zero Dependencies**: No external frameworks, libraries, or build tools
2. **Universal Compatibility**: Works in all modern browsers (IE10+)
3. **Offline Capable**: Fully functional without internet (except for sending)
4. **Self-Contained**: Single file contains entire application
5. **Cross-Platform**: Windows, macOS, Linux, mobile devices

## Technical Specifications

### Technology Stack

| Component | Technology | Justification |
|-----------|------------|---------------|
| **Core Language** | Vanilla JavaScript ES6+ | Universal browser support, no dependencies |
| **Styling** | CSS3 with Grid/Flexbox | Modern layout, responsive design |
| **File Handling** | HTML5 Drag & Drop API | Universal browser support since 2010 |
| **File Reading** | FileReader API | Standard browser API for file content access |
| **Data Storage** | localStorage API | Persistent client-side storage |
| **HTTP Requests** | Fetch API | Modern promise-based HTTP client |
| **Email Service** | Resend API | Reliable transactional email delivery |
| **Preview Rendering** | iframe sandbox | Secure HTML template preview |

### Browser Compatibility

The application targets modern browsers with native support for:
- HTML5 Drag & Drop API
- FileReader API  
- Fetch API
- localStorage API

Primary target browsers: Chrome, Firefox, Safari, and Edge (current versions)

## Application Architecture

### File Structure
```
email-tool/
└── index.html          (Complete application)

Deployment Structure:
└── Single file distribution
    └── Email to users or upload to shared drive
```

### Application Components

#### 1. HTML Structure
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Email Campaign Tool</title>
    <style>/* Embedded CSS */</style>
</head>
<body>
    <!-- Application UI Components -->
    <div id="app">
        <header><!-- App Header --></header>
        <main>
            <section id="template-manager"><!-- Template Management --></section>
            <section id="email-composer"><!-- Email Composition --></section>
            <section id="preview-panel"><!-- Email Preview --></section>
            <section id="send-panel"><!-- Send Interface --></section>
        </main>
        <footer><!-- Status Bar --></footer>
    </div>
    
    <!-- Modals -->
    <div id="config-modal"><!-- API Configuration --></div>
    <div id="confirm-modal"><!-- Send Confirmation --></div>
    
    <script>/* Embedded JavaScript */</script>
</body>
</html>
```

#### 2. CSS Architecture
```css
/* Reset and Base Styles */
* { box-sizing: border-box; }

/* Layout Components */
.app-grid { display: grid; grid-template-areas: "header" "main" "footer"; }
.main-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }

/* Component Styles */
.drop-zone { /* Drag & drop styling */ }
.template-card { /* Template selection styling */ }
.email-preview { /* Preview iframe styling */ }

/* Responsive Design */
@media (max-width: 768px) {
    .main-layout { grid-template-columns: 1fr; }
}

/* Application Branding */
:root {
    --primary: #2e6e8a;
    --secondary: #1aa7e3;
    --accent: #7bd1c6;
    --dark: #224f63;
    --light: #d0f0f6;
}
```

#### 3. JavaScript Architecture
```javascript
// Application State Management
const AppState = {
    templates: new Map(),
    selectedTemplate: null,
    apiKey: null,
    recipients: [],
    subject: '',
    config: {}
};

// Core Modules
const TemplateManager = { /* Template handling logic */ };
const EmailComposer = { /* Email composition logic */ };
const APIClient = { /* Resend API integration */ };
const UIController = { /* User interface management */ };
const StorageManager = { /* localStorage operations */ };
```

## Core Feature Implementation

### 1. Template Management System

#### 1.1 Drag & Drop Implementation
```javascript
// Drop Zone Handler
class DropZoneManager {
    constructor(dropZoneElement) {
        this.dropZone = dropZoneElement;
        this.initializeDropZone();
    }
    
    initializeDropZone() {
        // Prevent default drag behaviors
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            this.dropZone.addEventListener(eventName, this.preventDefaults, false);
        });
        
        // Visual feedback for drag operations
        ['dragenter', 'dragover'].forEach(eventName => {
            this.dropZone.addEventListener(eventName, this.highlightDropZone, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            this.dropZone.addEventListener(eventName, this.unhighlightDropZone, false);
        });
        
        // Handle file drops
        this.dropZone.addEventListener('drop', this.handleDrop.bind(this), false);
    }
    
    async handleDrop(e) {
        const files = Array.from(e.dataTransfer.files);
        const htmlFiles = files.filter(file => 
            file.type === 'text/html' || file.name.endsWith('.html')
        );
        
        for (const file of htmlFiles) {
            await this.processTemplate(file);
        }
    }
    
    async processTemplate(file) {
        try {
            const content = await file.text();
            const template = {
                id: generateId(),
                name: file.name,
                content: content,
                size: file.size,
                dateAdded: new Date().toISOString(),
                preview: this.generatePreview(content)
            };
            
            TemplateManager.addTemplate(template);
            UIController.updateTemplateList();
        } catch (error) {
            UIController.showError(`Failed to load template: ${file.name}`);
        }
    }
}
```

#### 1.2 Template Storage
```javascript
// Template Storage Manager
class TemplateStorage {
    static saveTemplate(template) {
        const templates = this.getTemplates();
        templates[template.id] = template;
        localStorage.setItem('email_templates', JSON.stringify(templates));
    }
    
    static getTemplates() {
        const stored = localStorage.getItem('email_templates');
        return stored ? JSON.parse(stored) : {};
    }
    
    static deleteTemplate(templateId) {
        const templates = this.getTemplates();
        delete templates[templateId];
        localStorage.setItem('email_templates', JSON.stringify(templates));
    }
    
    static clearAllTemplates() {
        localStorage.removeItem('email_templates');
    }
}
```

### 2. Email Composition System

#### 2.1 Recipient Management
```javascript
class RecipientManager {
    constructor() {
        this.recipients = [];
    }
    
    parseRecipients(input) {
        // Support multiple formats: comma-separated, line-separated, space-separated
        const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
        const emails = input.match(emailRegex) || [];
        
        return {
            valid: emails.filter(email => this.validateEmail(email)),
            invalid: emails.filter(email => !this.validateEmail(email))
        };
    }
    
    validateEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }
    
    formatRecipients(emails) {
        return emails.map(email => ({ email: email.trim() }));
    }
}
```

#### 2.2 Email Preview System
```javascript
class EmailPreview {
    constructor(previewContainer) {
        this.container = previewContainer;
        this.iframe = null;
        this.initializePreview();
    }
    
    initializePreview() {
        this.iframe = document.createElement('iframe');
        this.iframe.style.width = '100%';
        this.iframe.style.height = '500px';
        this.iframe.style.border = '1px solid #ccc';
        this.iframe.setAttribute('sandbox', 'allow-same-origin');
        this.container.appendChild(this.iframe);
    }
    
    updatePreview(htmlContent, subject) {
        const previewHTML = `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>${subject}</title>
                <style>
                    body { margin: 0; font-family: Arial, sans-serif; }
                    .email-header { 
                        background: #f5f5f5; 
                        padding: 10px; 
                        border-bottom: 1px solid #ddd;
                        font-size: 14px;
                        color: #666;
                    }
                </style>
            </head>
            <body>
                <div class="email-header">
                    <strong>Subject:</strong> ${subject}
                </div>
                ${htmlContent}
            </body>
            </html>
        `;
        
        this.iframe.srcdoc = previewHTML;
    }
}
```

### 3. Resend API Integration

#### 3.1 API Client Implementation
```javascript
class ResendAPIClient {
    constructor() {
        this.baseURL = 'https://api.resend.com';
        this.apiKey = null;
    }
    
    setApiKey(key) {
        this.apiKey = key;
        // Encrypt and store in localStorage
        const encrypted = this.encryptApiKey(key);
        localStorage.setItem('resend_api_key', encrypted);
    }
    
    getApiKey() {
        if (this.apiKey) return this.apiKey;
        
        const encrypted = localStorage.getItem('resend_api_key');
        if (encrypted) {
            this.apiKey = this.decryptApiKey(encrypted);
            return this.apiKey;
        }
        
        return null;
    }
    
    async sendEmail(emailData) {
        if (!this.getApiKey()) {
            throw new Error('API key not configured');
        }
        
        const payload = {
            from: emailData.from || 'Email Sender <noreply@example.com>',
            to: emailData.recipients,
            subject: emailData.subject,
            html: emailData.htmlContent
        };
        
        try {
            const response = await fetch(`${this.baseURL}/emails`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Failed to send email');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Email send error:', error);
            throw error;
        }
    }
    
    async verifyApiKey() {
        try {
            const response = await fetch(`${this.baseURL}/domains`, {
                headers: {
                    'Authorization': `Bearer ${this.getApiKey()}`
                }
            });
            
            return response.ok;
        } catch (error) {
            return false;
        }
    }
    
    // Simple encryption for API key storage
    encryptApiKey(key) {
        return btoa(key); // Base64 encoding (basic obfuscation)
    }
    
    decryptApiKey(encrypted) {
        return atob(encrypted); // Base64 decoding
    }
}
```

#### 3.2 Batch Email Sending
```javascript
class BatchEmailSender {
    constructor(apiClient) {
        this.apiClient = apiClient;
        this.batchSize = 10; // Send 10 emails at a time
        this.delay = 1000; // 1 second delay between batches
    }
    
    async sendBatchEmails(recipients, subject, htmlContent, progressCallback) {
        const batches = this.createBatches(recipients, this.batchSize);
        const results = [];
        
        for (let i = 0; i < batches.length; i++) {
            const batch = batches[i];
            
            try {
                const result = await this.apiClient.sendEmail({
                    recipients: batch,
                    subject: subject,
                    htmlContent: htmlContent
                });
                
                results.push({ success: true, data: result });
                
                if (progressCallback) {
                    progressCallback({
                        processed: (i + 1) * this.batchSize,
                        total: recipients.length,
                        currentBatch: i + 1,
                        totalBatches: batches.length
                    });
                }
                
                // Delay between batches to respect rate limits
                if (i < batches.length - 1) {
                    await this.delay(this.delay);
                }
                
            } catch (error) {
                results.push({ success: false, error: error.message });
            }
        }
        
        return results;
    }
    
    createBatches(array, batchSize) {
        const batches = [];
        for (let i = 0; i < array.length; i += batchSize) {
            batches.push(array.slice(i, i + batchSize));
        }
        return batches;
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
```

### 4. User Interface Implementation

#### 4.1 Application Controller
```javascript
class EmailApp {
    constructor() {
        this.state = {
            currentTemplate: null,
            recipients: [],
            subject: '',
            isConfigured: false
        };
        
        this.apiClient = new ResendAPIClient();
        this.templateManager = new TemplateManager();
        this.recipientManager = new RecipientManager();
        this.emailPreview = null;
        
        this.initializeApp();
    }
    
    initializeApp() {
        this.checkConfiguration();
        this.initializeDropZone();
        this.bindEventListeners();
        this.loadSavedTemplates();
    }
    
    checkConfiguration() {
        const apiKey = this.apiClient.getApiKey();
        this.state.isConfigured = !!apiKey;
        
        if (!this.state.isConfigured) {
            this.showConfigurationModal();
        }
    }
    
    bindEventListeners() {
        // Template selection
        document.getElementById('template-select').addEventListener('change', (e) => {
            this.selectTemplate(e.target.value);
        });
        
        // Subject input
        document.getElementById('subject-input').addEventListener('input', (e) => {
            this.state.subject = e.target.value;
            this.updatePreview();
        });
        
        // Recipients input
        document.getElementById('recipients-input').addEventListener('input', (e) => {
            this.parseRecipients(e.target.value);
        });
        
        // Send button
        document.getElementById('send-button').addEventListener('click', () => {
            this.sendEmails();
        });
        
        // Configuration button
        document.getElementById('config-button').addEventListener('click', () => {
            this.showConfigurationModal();
        });
    }
    
    async sendEmails() {
        if (!this.validateSendConditions()) return;
        
        this.showSendConfirmation();
    }
    
    validateSendConditions() {
        if (!this.state.currentTemplate) {
            this.showError('Please select an email template');
            return false;
        }
        
        if (!this.state.subject.trim()) {
            this.showError('Please enter an email subject');
            return false;
        }
        
        if (this.state.recipients.length === 0) {
            this.showError('Please enter at least one recipient');
            return false;
        }
        
        if (!this.state.isConfigured) {
            this.showError('Please configure your Resend API key');
            return false;
        }
        
        return true;
    }
}
```

## Security Specifications

### 1. API Key Security
```javascript
// Enhanced API Key Encryption
class SecureStorage {
    static encrypt(data, key = 'email-tool') {
        // Simple XOR encryption for client-side storage
        let encrypted = '';
        for (let i = 0; i < data.length; i++) {
            encrypted += String.fromCharCode(
                data.charCodeAt(i) ^ key.charCodeAt(i % key.length)
            );
        }
        return btoa(encrypted);
    }
    
    static decrypt(encryptedData, key = 'email-tool') {
        const data = atob(encryptedData);
        let decrypted = '';
        for (let i = 0; i < data.length; i++) {
            decrypted += String.fromCharCode(
                data.charCodeAt(i) ^ key.charCodeAt(i % key.length)
            );
        }
        return decrypted;
    }
}
```

### 2. Template Sanitization
```javascript
// HTML Template Sanitizer
class TemplateSanitizer {
    static sanitizeTemplate(htmlContent) {
        // Remove dangerous script tags and attributes
        const dangerous = [
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            /on\w+\s*=\s*["'][^"']*["']/gi,
            /javascript:/gi
        ];
        
        let sanitized = htmlContent;
        dangerous.forEach(pattern => {
            sanitized = sanitized.replace(pattern, '');
        });
        
        return sanitized;
    }
    
    static validateTemplate(htmlContent) {
        // Basic HTML validation
        const hasDoctype = /<!doctype/i.test(htmlContent);
        const hasHtmlTag = /<html/i.test(htmlContent);
        const hasBody = /<body/i.test(htmlContent);
        
        return {
            isValid: hasHtmlTag && hasBody,
            warnings: [
                !hasDoctype && 'Missing DOCTYPE declaration',
                !hasHtmlTag && 'Missing HTML tag',
                !hasBody && 'Missing BODY tag'
            ].filter(Boolean)
        };
    }
}
```

### 3. Input Validation
```javascript
// Comprehensive Input Validation
class InputValidator {
    static validateEmailBatch(emails) {
        const results = {
            valid: [],
            invalid: [],
            duplicates: []
        };
        
        const seen = new Set();
        
        emails.forEach(email => {
            const trimmed = email.trim().toLowerCase();
            
            if (!trimmed) return;
            
            if (seen.has(trimmed)) {
                results.duplicates.push(email);
                return;
            }
            
            seen.add(trimmed);
            
            if (this.isValidEmail(trimmed)) {
                results.valid.push(email);
            } else {
                results.invalid.push(email);
            }
        });
        
        return results;
    }
    
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email) && email.length <= 254;
    }
    
    static sanitizeSubject(subject) {
        // Remove potentially dangerous characters
        return subject
            .replace(/[<>]/g, '')
            .replace(/\n|\r/g, ' ')
            .trim()
            .substring(0, 255);
    }
}
```

## Performance Specifications

### File Size Targets
- **Total Application Size**: 150-200KB
- **Embedded CSS**: ~20-30KB
- **Embedded JavaScript**: ~100-150KB
- **HTML Structure**: ~5-10KB

### Loading Performance
- **Initial Load**: <100ms (local file)
- **Template Loading**: <500ms per template
- **Preview Generation**: <200ms
- **API Response**: <2000ms (network dependent)

### Memory Usage
- **Base Application**: ~5-10MB
- **Template Storage**: ~1MB per 100 templates
- **Preview Rendering**: ~2-5MB per preview

## Deployment Specifications

### Distribution Method
1. **Single File Distribution**: Email `index.html` to users
2. **Shared Drive**: Upload to company shared drive
3. **Version Control**: Maintain in Git repository for updates

### Installation Instructions
```markdown
# Email Campaign Tool - User Guide

## Installation
1. Download the `index.html` file
2. Save it to your computer (Desktop recommended)
3. Double-click the file to open in your web browser

## First-Time Setup
1. Click "Configure API" button
2. Enter your Resend API key
3. Click "Save Configuration"

## Sending Emails
1. Drag HTML email template files into the drop zone
2. Select a template from the dropdown
3. Enter recipient email addresses (one per line or comma-separated)
4. Enter email subject line
5. Preview your email
6. Click "Send Emails"
```

### Browser Deployment
```html
<!-- Localhost Serving Option -->
<!-- If CORS issues occur, serve via local server: -->
<!-- 
1. Save index.html to folder
2. Open command prompt in that folder
3. Run: python -m http.server 8000
4. Open: http://localhost:8000
-->
```

## Error Handling Specifications

### Error Categories
1. **Network Errors**: API connectivity issues
2. **Validation Errors**: Invalid email addresses, missing fields
3. **File Errors**: Template loading failures
4. **Authentication Errors**: Invalid API keys
5. **Rate Limit Errors**: API usage limits exceeded

### Error Handling Implementation
```javascript
class ErrorHandler {
    static handleApiError(error) {
        const errorMappings = {
            401: 'Invalid API key. Please check your configuration.',
            429: 'Rate limit exceeded. Please wait before sending more emails.',
            403: 'Permission denied. Check your API key permissions.',
            500: 'Server error. Please try again later.'
        };
        
        return errorMappings[error.status] || error.message || 'Unknown error occurred';
    }
    
    static showUserError(message, type = 'error') {
        const notification = document.createElement('div');
        notification.className = `notification notification--${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
    }
}
```

## Testing Specifications

### Functional Testing Checklist
- [ ] Template drag & drop functionality
- [ ] Template preview generation
- [ ] Email address validation
- [ ] API key configuration and storage
- [ ] Email sending with progress tracking
- [ ] Error handling and user feedback
- [ ] Responsive design on mobile devices

### Performance Testing
- [ ] Load time under 1 second
- [ ] Template loading under 500ms
- [ ] Memory usage under 50MB
- [ ] Batch email sending performance

## Maintenance Specifications

### Update Process
1. Modify single `index.html` file
2. Test in target browsers
3. Distribute updated file to users
4. Maintain version number in file header

### Monitoring
- User feedback collection
- Browser compatibility monitoring
- API error rate tracking
- Performance metrics collection

## Risk Mitigation

### Technical Risks
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| API Rate Limits | Medium | Medium | Implement batch processing with delays |
| Large File Performance | Low | Medium | File size validation and warnings |

### Security Risks
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| API Key Exposure | Medium | High | Client-side encryption, user education |
| XSS in Templates | Low | Medium | Template sanitization |
| Email Injection | Low | High | Input validation and sanitization |

## Success Metrics

### User Experience Metrics
- **Setup Time**: < 2 minutes from download to first email sent
- **Learning Curve**: < 5 minutes to understand interface
- **Error Rate**: < 5% of email sending attempts fail
- **User Satisfaction**: > 90% positive feedback

### Technical Metrics
- **Load Performance**: < 1 second initial load
- **Reliability**: > 99% uptime (browser-dependent)
- **File Size**: < 200KB total application size

## Implementation Timeline

### Phase 1: Core Functionality
- [x] Basic HTML structure and CSS
- [x] Drag & drop implementation
- [x] Template storage system
- [x] Email preview functionality

### Phase 2: API Integration
- [ ] Resend API client implementation
- [ ] Error handling system

Resend docs:
- https://resend.com/docs/api-reference/introduction
- https://resend.com/docs/api-reference/emails/send-email

Resend api call curl
```
curl -X POST 'https://api.resend.com/emails' \
  -H 'Authorization: Bearer <RESEND_API_KEY>' \
  -H 'Content-Type: application/json' \
  -d $'{
    "from": "onboarding@resend.dev",
    "to": "matthewshan99@gmail.com",
    "subject": "Hello World",
    "html": "<p>Congrats on sending your <strong>first email</strong>!</p>"
  }'
```
^ The application should accept a from, to, subject, html, and API token

### Phase 3: Polish & Testing (Optional)
- [ ] Performance optimization
- [ ] User interface refinement
- [ ] Additional features and enhancements

### Phase 4: Automated Deployment
- [ ] GitHub Actions workflow creation
- [ ] Automated release bundling
- [ ] ZIP package generation with required files
- [ ] Release asset publishing

### Phase 5: More features
- [ ] Email composition interface
- [ ] Batch sending functionality

## Conclusion

This technical specification provides a comprehensive blueprint for implementing a single HTML file email campaign tool. The solution balances simplicity, functionality, and security while maintaining zero dependencies and universal browser compatibility.

The drag & drop approach eliminates previous technical constraints and provides an intuitive user experience that requires minimal technical knowledge. The self-contained architecture ensures easy distribution and maintenance while the Resend API integration provides reliable email delivery.

Next steps involve beginning Phase 1 implementation with the core HTML structure and drag & drop functionality.
