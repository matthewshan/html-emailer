// HTML Emailer Tool- Template Sanitizer

// Template Sanitizer
class TemplateSanitizer {
    static sanitizeTemplate(htmlContent) {
        // More conservative sanitization that preserves email-specific elements
        const dangerous = [
            // Only remove script tags that are not in conditional comments
            /(?<!<!--\[if[^>]*>[\s\S]*?)<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>(?![\s\S]*?<!\[endif\]-->)/gi,
            
            // Remove event handlers (but preserve VML elements in conditional comments)
            /(?<!<!--\[if[^>]*>[\s\S]*?)\s(onclick|onload|onmouseover|onmouseout|onfocus|onblur|onchange|onsubmit|onreset|onselect|onkeydown|onkeypress|onkeyup)\s*=\s*["'][^"']*["']/gi,
            
            // Remove dangerous iframe attributes
            /<iframe[^>]*srcdoc\s*=\s*["'][^"']*<script[^"']*["']/gi,
            
            // Remove form elements (but preserve VML elements)
            /(?<!<!--\[if[^>]*>[\s\S]*?)<form[^>]*>/gi,
            /(?<!<!--\[if[^>]*>[\s\S]*?)<input[^>]*>/gi,
            /(?<!<!--\[if[^>]*>[\s\S]*?)<textarea[^>]*>/gi,
            /(?<!<!--\[if[^>]*>[\s\S]*?)<select[^>]*>/gi,
            /(?<!<!--\[if[^>]*>[\s\S]*?)<button[^>]*>/gi
        ];
        
        let sanitized = htmlContent;
        dangerous.forEach(pattern => {
            sanitized = sanitized.replace(pattern, '');
        });
        
        // More precise attribute removal that preserves VML and conditional comments
        let contentToSanitize = sanitized;
        
        // Temporarily replace conditional comments to preserve them
        const conditionalComments = [];
        contentToSanitize = contentToSanitize.replace(/(<!--\[if[^>]*>[\s\S]*?<!\[endif\]-->)/gi, (match, comment) => {
            conditionalComments.push(comment);
            return `__CONDITIONAL_COMMENT_${conditionalComments.length - 1}__`;
        });
        
        // Remove dangerous attributes from remaining elements
        contentToSanitize = contentToSanitize.replace(/\s(onclick|onload|onmouseover|onmouseout|onfocus|onblur|onchange|onsubmit|onreset|onselect|onkeydown|onkeypress|onkeyup)\s*=\s*["'][^"']*["']/gi, '');
        
        // Restore conditional comments
        conditionalComments.forEach((comment, index) => {
            contentToSanitize = contentToSanitize.replace(`__CONDITIONAL_COMMENT_${index}__`, comment);
        });
        
        return contentToSanitize;
    }
    
    static hasJavaScript(htmlContent) {
        // Simplified JavaScript detection that works in all browsers
        
        // First, remove conditional comments and VML to avoid false positives
        let contentToCheck = htmlContent
            // Remove MSO conditional comments
            .replace(/<!--\[if[^>]*>[\s\S]*?<!\[endif\]-->/gi, '')
            // Remove VML namespace declarations and elements
            .replace(/xmlns:v="urn:schemas-microsoft-com:vml"/gi, '')
            .replace(/<v:[^>]*>[\s\S]*?<\/v:[^>]*>/gi, '')
            .replace(/<w:[^>]*\/?>/gi, '');
        
        const jsPatterns = [
            // Script tags
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            
            // Event handlers in HTML attributes
            /\s(onclick|onload|onmouseover|onmouseout|onfocus|onblur|onchange|onsubmit|onreset|onselect|onkeydown|onkeypress|onkeyup)\s*=\s*["'][^"']*["']/gi,
            
            // JavaScript/VBScript URLs in href or src
            /(href|src)\s*=\s*["']?\s*(javascript|vbscript):/gi,
            
            // Dangerous functions
            /\beval\s*\(/gi,
            /\bsetTimeout\s*\(/gi,
            /\bsetInterval\s*\(/gi,
            /\bnew\s+Function\s*\(/gi,
            
            // Script tags in SVG
            /<svg[^>]*>[\s\S]*?<script[\s\S]*?<\/svg>/gi,
            
            // CSS expressions
            /expression\s*\(/gi,
            
            // JavaScript URLs in CSS
            /url\s*\(\s*["']?\s*javascript:/gi
        ];
        
        return jsPatterns.some(pattern => pattern.test(contentToCheck));
    }
    
    static validateTemplate(htmlContent) {
        const hasHtmlTag = /<html/i.test(htmlContent);
        const hasBody = /<body/i.test(htmlContent);
        const hasDoctype = /<!doctype/i.test(htmlContent);
        
        // Check for JavaScript content
        if (this.hasJavaScript(htmlContent)) {
            return {
                isValid: false,
                error: 'HTML template contains JavaScript which is not allowed for security reasons',
                warnings: []
            };
        }
        
        // More lenient validation - allow templates without full HTML structure
        return {
            isValid: true, // Always valid if no JavaScript
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
            /[\x00-\x1f\x7f-\x9f]/,
            /\.js$/i,
            /\.php$/i,
            /\.asp$/i,
            /\.jsp$/i
        ];
        
        const isSafe = !dangerousPatterns.some(pattern => pattern.test(fileName));
        const isValidLength = fileName.length > 0 && fileName.length <= 255;
        const isHTMLFile = fileName.toLowerCase().endsWith('.html');
        
        return {
            isValid: isSafe && isValidLength && isHTMLFile,
            reason: !isSafe ? 'Filename contains potentially dangerous content' : 
                   !isValidLength ? 'Filename length must be between 1-255 characters' :
                   !isHTMLFile ? 'Only .html files are allowed' : null
        };
    }
}
