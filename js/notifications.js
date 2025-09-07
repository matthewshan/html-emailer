// HTML Emailer Tool- Notification System

// Notification System
class NotificationManager {
    static show(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message; // Using textContent instead of innerHTML for safety
        
        document.body.appendChild(notification);
        
        // Trigger animation
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Auto-remove
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, duration);
    }
    
    static success(message) {
        this.show(message, 'success');
    }
    
    static error(message, duration = 8000) {
        this.show(message, 'error', duration);
    }
    
    static warning(message, duration = 6000) {
        this.show(message, 'warning', duration);
    }
    
    static info(message) {
        this.show(message, 'info');
    }
}
