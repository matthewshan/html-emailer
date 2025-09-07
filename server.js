const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '1mb' })); // Limit JSON payload size
app.use(express.static('.'));

// Security middleware for HTML content validation
app.use('/api/send-email', (req, res, next) => {
    // Additional security headers
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('X-Frame-Options', 'DENY');
    res.header('X-XSS-Protection', '1; mode=block');
    next();
});

// CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'https://api.resend.com');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
    } else {
        next();
    }
});

// Helper function to validate HTML content
function validateHTMLContent(htmlContent) {
    if (!htmlContent || typeof htmlContent !== 'string') {
        return { isValid: false, error: 'Invalid HTML content' };
    }
    
    // Remove conditional comments and VML before checking
    let contentToCheck = htmlContent
        // Remove MSO conditional comments
        .replace(/<!--\[if[^>]*>[\s\S]*?<!\[endif\]-->/gi, '')
        // Remove VML namespace declarations and elements
        .replace(/xmlns:v="urn:schemas-microsoft-com:vml"/gi, '')
        .replace(/<v:[^>]*>[\s\S]*?<\/v:[^>]*>/gi, '')
        .replace(/<w:[^>]*\/?>/gi, '');
    
    // Simplified JavaScript detection patterns
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
        /\bnew\s+Function\s*\(/gi
    ];
    
    for (const pattern of jsPatterns) {
        if (pattern.test(contentToCheck)) {
            return { isValid: false, error: 'HTML content contains JavaScript which is not allowed' };
        }
    }
    
    return { isValid: true };
}

// Proxy endpoint for Resend API
app.post('/api/send-email', async (req, res) => {
    try {
        const { apiKey, emailData } = req.body;
        
        if (!apiKey) {
            return res.status(400).json({ error: 'API key is required' });
        }
        
        // Validate HTML content for JavaScript
        if (emailData && emailData.html) {
            const validation = validateHTMLContent(emailData.html);
            if (!validation.isValid) {
                return res.status(400).json({ error: validation.error });
            }
        }
        
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(emailData)
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            return res.status(response.status).json(data);
        }
        
        res.json(data);
    } catch (error) {
        console.error('Proxy error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint to validate HTML content
app.post('/api/validate-html', (req, res) => {
    try {
        const { htmlContent } = req.body;
        
        if (!htmlContent) {
            return res.status(400).json({ error: 'HTML content is required' });
        }
        
        const validation = validateHTMLContent(htmlContent);
        
        if (!validation.isValid) {
            return res.status(400).json({ 
                error: validation.error,
                isValid: false 
            });
        }
        
        res.json({ 
            isValid: true,
            message: 'HTML content is valid'
        });
    } catch (error) {
        console.error('Validation error:', error);
        res.status(500).json({ error: 'Internal server error during validation' });
    }
});

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
