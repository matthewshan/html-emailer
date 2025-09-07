# ADR-001: Migration from Client-Side to Proxy Server Architecture

**Date:** September 6, 2025  
**Status:** Accepted  
**Context:** CORS Limitation Discovery  

## Summary

Migrated from a pure client-side HTML application to a Node.js proxy server architecture to resolve Cross-Origin Resource Sharing (CORS) restrictions when integrating with the Resend API.

## Context

The original design called for a "zero-dependency, browser-based tool" that would run entirely from a single HTML file. This approach was inspired by the simplicity of client-side applications and the desire to minimize deployment complexity.

However, during implementation, we discovered that the Resend API (like most email service APIs) does not support CORS requests from browser clients. This is a security feature designed to prevent API keys from being exposed in client-side code and to prevent unauthorized cross-origin requests.

**Key Issue:** The developer initially overlooked CORS considerations, having primarily worked with Next.js applications where API routes handle server-side requests, naturally avoiding client-side CORS issues.

## Problem

```
Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at https://api.resend.com/emails. (Reason: CORS request did not succeed). Status code: (null).
```

The browser's same-origin policy prevented direct API calls to Resend from the client-side JavaScript, making the core email sending functionality impossible to implement as originally designed.

## Decision

**We decided to implement a Node.js proxy server architecture with the following components:**

1. **Express.js Proxy Server** (`server.js`)
   - Acts as an intermediary between the client and Resend API
   - Handles CORS headers to allow client requests
   - Securely manages API key transmission
   - Provides a local endpoint `/api/send-email`

2. **Docker Containerization**
   - Ensures consistent deployment environment
   - Simplifies setup process
   - Eliminates local Node.js installation requirement

3. **Modified Client Architecture**
   - Updated API client to target local proxy instead of Resend directly
   - Maintained all original UI and UX functionality
   - Preserved drag-and-drop template management

## Alternatives Considered

### 1. CORS Proxy Services (Rejected)
- **Option:** Use third-party CORS proxy services
- **Rejection Reason:** Security risk exposing API keys through external services

### 2. Serverless Functions (Considered)
- **Option:** Deploy proxy as Vercel/Netlify functions
- **Status:** Viable alternative for cloud deployment
- **Decision:** Chose Docker for local development simplicity

### 3. Browser Extension (Rejected)
- **Option:** Package as browser extension to bypass CORS
- **Rejection Reason:** Increased complexity and reduced accessibility

## Implementation Details

### Server Architecture
```javascript
// Proxy endpoint structure
app.post('/api/send-email', async (req, res) => {
    const { apiKey, emailData } = req.body;
    // Forward to Resend API with proper headers
});
```

### Client Changes
```javascript
// Before: Direct API call
fetch('https://api.resend.com/emails', { ... })

// After: Proxy call
fetch('/api/send-email', { 
    body: JSON.stringify({ apiKey, emailData }) 
})
```

### Deployment
- **Development:** `docker-compose up --build`
- **Production:** Standard Node.js deployment or containerized hosting

## Consequences

### Positive
- ✅ **Resolves CORS Issue:** Email sending functionality now works
- ✅ **Better Security:** API keys not exposed in client-side code
- ✅ **Deployment Flexibility:** Can be deployed to any Node.js hosting
- ✅ **Docker Integration:** Consistent environment across systems
- ✅ **Maintains UX:** All original user-facing features preserved

### Negative
- ❌ **Dependency Introduction:** No longer "zero-dependency"
- ❌ **Server Requirement:** Cannot run purely from file system
- ❌ **Complexity Increase:** Additional deployment steps required
- ❌ **Resource Usage:** Requires server resources instead of client-only

### Neutral
- 🔄 **Architecture Shift:** From static to dynamic application
- 🔄 **Setup Process:** Docker simplifies but changes deployment model

## Lessons Learned

1. **CORS Considerations:** Always verify API CORS policies during architecture planning
2. **Framework Assumptions:** Experience with full-stack frameworks (Next.js) can create blind spots for client-side limitations
3. **Early Testing:** API integration testing should occur early in development cycle
4. **Documentation Review:** Third-party API documentation should be thoroughly reviewed for browser compatibility

## Future Considerations

- **Serverless Migration:** Consider migrating proxy to serverless functions for cloud deployment
- **Authentication Enhancement:** Implement session-based API key management
- **Error Handling:** Enhance proxy error handling and retry logic
- **Rate Limiting:** Add client-side rate limiting to prevent API abuse

## Related Documents

- `tech-spec.md` - Original technical specification
- `research.md` - Initial research and requirements
- `server.js` - Proxy server implementation
- `Dockerfile` - Container configuration

---

**Author:** GitHub Copilot  
**Reviewed By:** Matthew Shan