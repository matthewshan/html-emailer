
# HTML Emailer

**HTML Emailer** is a browser-based tool for sending HTML email campaigns using the [Resend](https://resend.com/) API. It provides a simple drag-and-drop interface for loading HTML email templates, composing messages, and sending them to recipients.

## Features
- Drag & drop HTML email templates directly into the app
- Preview and select templates before sending
- Compose subject lines and recipient lists
- Send emails via the Resend API
- Secure API key handling via local proxy server

**For sending emails:**
1. **An HTML Email Template**
   - Prepare your email as a `.html` file (you can use any email template, or export from your favorite email builder).

2. **A Resend Account & API Key**
   - Sign up at [resend.com](https://resend.com/)
   - Create and verify your sending domain (for best deliverability)
   - Generate an API key from your Resend dashboard


## Using the Application
1. Click "Configure API" and enter your Resend API key
2. Drag your HTML email template(s) into the drop zone
3. Enter recipient email addresses and a subject line
4. Preview your email, then click "Send" to deliver via Resend

## Technical Notes
Due to CORS restrictions, the Resend API cannot be called directly from a browser. This tool includes a simple Node.js proxy server that handles the API communication securely.

---
For more details, see the `ai-context/research.md` and `ai-context/tech-spec.md` files.
