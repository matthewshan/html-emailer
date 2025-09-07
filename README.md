
# HTML Emailer

**HTML Emailer** is a zero-dependency, browser-based tool for sending  HTML email campaigns using the [Resend](https://resend.com/) API. It provides a simple drag-and-drop interface for loading HTML email templates, composing messages, and sending them to recipients—all from a single, self-contained `index.html` file. No installation or server setup is required: just open the file in your browser and start sending.

## Features
- Drag & drop HTML email templates directly into the app
- Preview and select templates before sending
- Compose subject lines and recipient lists (WIP)
- Send emails via the Resend API (WIP)
- Secure API key storage in your browser (WIP)

## Prerequisites
To use this application, you need:

1. **An HTML Email Template**
	- Prepare your email as a `.html` file (you can use any email template, or export from your favorite email builder).

2. **A Resend Account & API Key**
	- Sign up at [resend.com](https://resend.com/)
	- Create and verify your sending domain (for best deliverability)
	- Generate an API key from your Resend dashboard

## Getting Started
1. Download or clone this repository.
2. Open `index.html` in your web browser.
3. Click "Configure API" and enter your Resend API key.
4. Drag your HTML email template(s) into the drop zone.
5. Enter recipient email addresses and a subject line.
6. Preview your email, then click "Send" to deliver via Resend.

---
For more details, see the `ai-context/research.md` and `ai-context/tech-spec.md` files.
