const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy to get accurate IP addresses
app.set('trust proxy', true);

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

// Logging middleware
app.use((req, res, next) => {
    const clientIP = req.ip || 
                    req.connection.remoteAddress || 
                    req.socket.remoteAddress ||
                    (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
                    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
                    req.headers['x-real-ip'] ||
                    'unknown';
    
    const timestamp = new Date().toISOString();
    const userAgent = req.headers['user-agent'] || 'unknown';
    
    console.log(`[${timestamp}] ${req.method} ${req.url} - IP: ${clientIP} - User-Agent: ${userAgent}`);
    
    next();
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
    const clientIP = req.ip || 'unknown';
    const timestamp = new Date().toISOString();
    
    try {
        const { apiKey, emailData } = req.body;
        
        // Log email sending attempt
        console.log(`[${timestamp}] EMAIL SEND ATTEMPT - IP: ${clientIP} - Recipients: ${emailData?.to?.length || 0} - Subject: ${emailData?.subject || 'N/A'}`);
        
        if (!apiKey) {
            console.log(`[${timestamp}] EMAIL SEND FAILED - IP: ${clientIP} - Reason: Missing API key`);
            return res.status(400).json({ error: 'API key is required' });
        }
        
        // Validate HTML content for JavaScript
        if (emailData && emailData.html) {
            const validation = validateHTMLContent(emailData.html);
            if (!validation.isValid) {
                console.log(`[${timestamp}] EMAIL SEND FAILED - IP: ${clientIP} - Reason: ${validation.error}`);
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
            console.log(`[${timestamp}] EMAIL SEND FAILED - IP: ${clientIP} - Resend API Error: ${response.status} - ${JSON.stringify(data)}`);
            return res.status(response.status).json(data);
        }
        
        console.log(`[${timestamp}] EMAIL SEND SUCCESS - IP: ${clientIP} - Email ID: ${data.id || 'N/A'}`);
        res.json(data);
    } catch (error) {
        console.error(`[${timestamp}] EMAIL SEND ERROR - IP: ${clientIP} - Error:`, error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Endpoint to validate HTML content
app.post('/api/validate-html', (req, res) => {
    const clientIP = req.ip || 'unknown';
    const timestamp = new Date().toISOString();
    
    try {
        const { htmlContent } = req.body;
        
        console.log(`[${timestamp}] HTML VALIDATION REQUEST - IP: ${clientIP} - Content Length: ${htmlContent?.length || 0} bytes`);
        
        if (!htmlContent) {
            console.log(`[${timestamp}] HTML VALIDATION FAILED - IP: ${clientIP} - Reason: Missing HTML content`);
            return res.status(400).json({ error: 'HTML content is required' });
        }
        
        const validation = validateHTMLContent(htmlContent);
        
        if (!validation.isValid) {
            console.log(`[${timestamp}] HTML VALIDATION FAILED - IP: ${clientIP} - Reason: ${validation.error}`);
            return res.status(400).json({ 
                error: validation.error,
                isValid: false 
            });
        }
        
        console.log(`[${timestamp}] HTML VALIDATION SUCCESS - IP: ${clientIP}`);
        res.json({ 
            isValid: true,
            message: 'HTML content is valid'
        });
    } catch (error) {
        console.error(`[${timestamp}] HTML VALIDATION ERROR - IP: ${clientIP} - Error:`, error);
        res.status(500).json({ error: 'Internal server error during validation' });
    }
});

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] SERVER STARTED - Port: ${PORT} - Email Campaign Tool API Server`);
    console.log(`[${timestamp}] Server running at http://localhost:${PORT}`);
    console.log(`[${timestamp}] Logging enabled - All requests will be logged with IP addresses`);
});
