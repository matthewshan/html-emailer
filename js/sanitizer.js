// HTML Emailer Tool- Template Sanitizer

// Template Sanitizer
class TemplateSanitizer {
    static sanitizeTemplate(htmlContent) {
        // Remove potentially dangerous script tags and attributes
        const dangerous = [
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            /on\w+\s*=\s*["'][^"']*["']/gi,
            /javascript:/gi,
            /vbscript:/gi,
            /data:text\/html/gi,
            /<iframe[^>]*>/gi,
            /<object[^>]*>/gi,
            /<embed[^>]*>/gi,
            /<form[^>]*>/gi,
            /<input[^>]*>/gi,
            /<textarea[^>]*>/gi,
            /<select[^>]*>/gi,
            /<button[^>]*>/gi,
            /<link[^>]*rel\s*=\s*["']?stylesheet["']?[^>]*>/gi
        ];
        
        let sanitized = htmlContent;
        dangerous.forEach(pattern => {
            sanitized = sanitized.replace(pattern, '');
        });
        
        // Remove dangerous attributes from remaining elements
        sanitized = sanitized.replace(/\s(on\w+|href|src)\s*=\s*["'][^"']*["']/gi, '');
        
        return sanitized;
    }
    
    static validateTemplate(htmlContent) {
        const hasHtmlTag = /<html/i.test(htmlContent);
        const hasBody = /<body/i.test(htmlContent);
        const hasDoctype = /<!doctype/i.test(htmlContent);
        
        return {
            isValid: hasHtmlTag && hasBody,
            warnings: [
                !hasDoctype && 'Missing DOCTYPE declaration',
                !hasHtmlTag && 'Missing HTML tag',
                !hasBody && 'Missing BODY tag'
            ].filter(Boolean)
        };
    }
    
    static generatePreview(htmlContent) {
        // Extract title or use filename
        const titleMatch = htmlContent.match(/<title[^>]*>([^<]+)<\/title>/i);
        const title = titleMatch ? escapeHtml(titleMatch[1]) : 'Email Template';
        
        // Create a safe preview version
        const sanitized = this.sanitizeTemplate(htmlContent);
        
        return {
            title: title,
            content: sanitized
        };
    }
    
    static validateFileName(fileName) {
        // Check for potentially malicious file names
        const dangerousPatterns = [
            /<script/i,
            /javascript:/i,
            /vbscript:/i,
            /data:/i,
            /\0/,
            /[\x00-\x1f\x7f-\x9f]/
        ];
        
        const isSafe = !dangerousPatterns.some(pattern => pattern.test(fileName));
        const isValidLength = fileName.length > 0 && fileName.length <= 255;
        
        return {
            isValid: isSafe && isValidLength,
            reason: !isSafe ? 'Filename contains potentially dangerous content' : 
                   !isValidLength ? 'Filename length must be between 1-255 characters' : null
        };
    }
}
