# ADR-002: API Key Security - No Local Storage Persistence

**Date:** September 7, 2025  
**Status:** Accepted  
**Context:** Security Enhancement  

## Summary

Decided against storing Resend API keys in browser localStorage for security reasons. API keys are now required to be entered fresh for each email send operation, ensuring credentials never persist in the browser environment.

## Context

During the initial implementation, the application was designed to store the Resend API key in browser localStorage alongside other configuration data (from email, from name) for user convenience. This approach would have allowed users to configure their API key once and have it automatically loaded for subsequent email operations.

However, this design posed significant security risks and violated best practices for credential management in web applications.

## Problem

**Security Vulnerabilities with localStorage API Key Storage:**

1. **Persistent Exposure**: localStorage data persists across browser sessions and survives browser restarts, creating a long-term attack surface
2. **Cross-Site Scripting (XSS) Vulnerability**: Any XSS attack could access localStorage and extract the API key
3. **Browser Extension Access**: Malicious browser extensions can read localStorage data from any domain
4. **Shared Computer Risk**: On shared computers, subsequent users could access stored credentials
5. **Developer Tools Exposure**: API keys would be visible in browser developer tools localStorage inspection
6. **No Encryption**: localStorage stores data in plain text without any encryption
7. **Backup/Sync Risks**: Browser data synchronization could propagate API keys across devices unintentionally

**Real-World Attack Scenarios:**

- Malicious advertisement or compromised CDN injects script that reads localStorage
- Browser extension with overly broad permissions harvests stored credentials
- Physical access to unlocked computer allows credential extraction
- Cross-site scripting through user-uploaded HTML email templates

## Decision

**We decided to implement a "fresh entry" model for API key handling:**

### Implementation Details

1. **No Persistence**: API keys are never stored in localStorage, sessionStorage, or any browser storage mechanism
2. **Per-Send Entry**: Users must enter their API key fresh for each email send operation
3. **Immediate Clearing**: API key fields are cleared immediately after use and when modals are closed
4. **Memory Only**: API keys exist only temporarily in JavaScript memory during the send operation
5. **Startup Cleanup**: Application actively removes any legacy stored API keys on initialization

### Password Manager Integration

To balance security with usability, we implemented password manager compatibility:

```html
<input type="password" 
       id="send-api-key" 
       autocomplete="new-password"
       data-lpignore="false"
       name="resend-api-key">
```

This allows users to:

- Save API keys securely in password managers
- Auto-fill when needed
- Benefit from password manager encryption and security features

## Alternatives Considered

### Alternative 1: Encrypted localStorage Storage

**Rejected** - Still vulnerable to XSS attacks since decryption key would need to be accessible to JavaScript

### Alternative 2: Session-Based Storage

**Rejected** - Reduces attack window but doesn't eliminate XSS vulnerability

### Alternative 3: Server-Side Key Storage

**Rejected** - Would require user accounts and authentication, dramatically increasing complexity

### Alternative 4: Environment Variables

**Rejected** - Not applicable to client-side applications

## Consequences

### Positive

- **Enhanced Security**: Eliminates persistent credential storage attack vectors
- **Compliance**: Aligns with security best practices for credential management
- **User Education**: Encourages users to use proper credential management tools
- **Zero Trust**: Follows principle of not trusting browser storage for sensitive data
- **Password Manager Friendly**: Leverages user's existing secure credential storage

### Negative

- **Reduced Convenience**: Users must enter API key for each send operation
- **Potential User Friction**: May discourage frequent use due to repeated entry requirement
- **Memory Management**: Requires careful handling of credentials in JavaScript memory

### Mitigations

- Clear messaging about security benefits
- Password manager integration for usability
- Quick modal access for configuration
- Secure credential handling best practices

## Security Benefits

1. **Attack Surface Reduction**: No persistent credentials to compromise
2. **Session Isolation**: Each email send is an isolated security context
3. **Memory Safety**: Credentials cleared immediately after use
4. **XSS Resistance**: Even successful XSS attacks cannot harvest persistent credentials
5. **Physical Security**: No credentials survive browser sessions on shared computers

## Implementation Status

- ✅ API key field moved to send modal
- ✅ localStorage persistence removed
- ✅ Credential clearing implemented
- ✅ Password manager compatibility added
- ✅ Legacy credential cleanup implemented
- ✅ Security-focused form attributes configured

## Future Considerations

- Monitor user feedback regarding convenience vs. security trade-off
- Consider implementing optional session-based caching with explicit user consent
- Evaluate integration with Web Authentication API for enhanced security
- Consider warning users about credential storage best practices

---

**Related ADRs:** None

**References:**

- [OWASP Web Storage Security](https://owasp.org/www-community/vulnerabilities/HTML5_Local_Storage)
- [MDN Web Security Guidelines](https://developer.mozilla.org/en-US/docs/Web/Security)
- [Resend API Security Documentation](https://resend.com/docs/api-reference/introduction#authentication)
