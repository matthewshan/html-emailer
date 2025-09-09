# ADR-003: Migration to Next.js, Tailwind CSS, and React Architecture

**Date:** September 8, 2025  
**Status:** Proposed  
**Context:** Modern Framework Migration for Enhanced Developer Experience  

## Summary

Migrate the current HTML/CSS/JavaScript application to a modern Next.js framework with React components, Tailwind CSS for styling, and structured API routes to improve maintainability, scalability, and developer experience while preserving all existing functionality.

## Context

The current application successfully implements the core email campaign functionality using vanilla HTML, CSS, and JavaScript with an Express.js proxy server. However, as the application grows in complexity and features, several limitations have become apparent:

**Current Architecture Limitations:**
1. **Code Organization**: All JavaScript logic exists in a single file, making maintenance difficult
2. **Styling Maintainability**: Custom CSS is becoming unwieldy without a systematic approach
3. **Component Reusability**: UI elements are tightly coupled, limiting reusability
4. **State Management**: Global state is managed through vanilla JavaScript, prone to bugs
5. **Developer Experience**: No hot reload, type safety, or modern tooling benefits
6. **Testing Complexity**: Vanilla JavaScript structure makes unit testing challenging
7. **Scalability Concerns**: Adding new features requires extensive refactoring

**Business Drivers:**
- Need for faster feature development cycles
- Requirement for better code maintainability
- Desire for improved developer onboarding experience
- Plan to add advanced features (email analytics, template library, user management)

## Problem

The current vanilla JavaScript architecture creates several development bottlenecks:

1. **Monolithic Structure**: All functionality exists in large, interconnected files
2. **Manual State Synchronization**: UI updates require manual DOM manipulation
3. **CSS Conflicts**: Global styles create unexpected side effects
4. **Limited Reusability**: UI patterns are duplicated across different modals/panels
5. **Development Speed**: Adding features requires understanding the entire codebase
6. **Error Prone**: Manual event binding and state management leads to bugs

## Decision

**We will migrate to a modern Next.js application with the following technology stack:**

### Core Technologies
- **Next.js**: React framework with App Router for SSR/SSG capabilities
- **React**: Component-based UI with hooks for state management
- **Zustand**: Lightweight state management solution for React
- **Tailwind CSS**: Utility-first CSS framework for rapid styling
- **TypeScript**: Type safety and enhanced developer experience

### Architecture Principles
- **Component-Based Design**: Each modal and panel becomes a reusable React component
- **Modern UI Patterns**: Toast notifications for user feedback and status updates
- **API Route Migration**: Convert Express.js endpoints to Next.js API routes
- **Gradual Migration**: Phased approach optimized for AI agent development
- **Preservation of Functionality**: Maintain all existing features during migration

## Implementation Phases

### Phase 1: Project Setup and Foundation
**Objective**: Establish Next.js foundation and project structure

**Tasks:**
1. **Manual Setup** (Human-driven):
   - Create new Next.js application with TypeScript
   - Install and configure Tailwind CSS
   - Install Zustand for state management
   - Set up project structure with appropriate directories
   - Configure essential development tools (ESLint, Prettier)

2. **AI Agent Tasks**:
   - Create component directory structure (`/components/ui`, `/components/modals`, `/components/panels`)
   - Create stores directory structure (`/stores`)
   - Set up Tailwind configuration with custom theme matching current design
   - Create basic layout components (`Header`, `Footer`, `MainLayout`)
   - Implement base utility functions and type definitions
   - Set up Zustand store boilerplate and patterns

**Deliverables:**
- Functional Next.js application with routing
- Tailwind CSS configuration with custom design tokens
- Zustand integration and store structure
- Basic component structure and layout
- Development environment setup

**Success Criteria:**
- Next.js application starts without errors
- Tailwind classes render correctly
- Zustand stores are properly configured
- Basic navigation structure in place

### Phase 2: UI Component Migration
**Objective**: Convert existing UI elements to React components with Tailwind styling

**Sub-Phase 2A: Core UI Components**
**AI Agent Tasks:**
1. **Base Components**:
   - `Button` component with variants (primary, secondary, danger)
   - `Input` component with validation states
   - `Modal` base component with backdrop and close functionality
   - `Card` component for template displays
   - `LoadingSpinner` component
   - `Notification` component for alerts/errors

2. **Form Components**:
   - `TextInput` with validation
   - `TextArea` for recipients and message content
   - `Select` dropdown for template selection
   - `FileUpload` for drag-and-drop functionality

**Sub-Phase 2B: Panel Components**
**AI Agent Tasks:**
1. **Template Management Panel** (`/components/panels/TemplatePanel.tsx`):
   - Convert template selection UI
   - Implement drag-and-drop zone with React
   - Template list display with actions
   - Template preview thumbnail generation

2. **Email Composition Panel** (`/components/panels/CompositionPanel.tsx`):
   - Subject line input
   - Recipients management interface
   - From email/name configuration
   - Send button with loading states

3. **Preview Panel** (`/components/panels/PreviewPanel.tsx`):
   - Email preview iframe
   - Mobile/desktop view toggle
   - Template validation status
   - Preview error handling

**Sub-Phase 2C: Modal Components**
**AI Agent Tasks:**
1. **Configuration Modal** (`/components/modals/ConfigModal.tsx`):
   - API key input (with security considerations from ADR-002)
   - Default sender configuration
   - Settings persistence (non-sensitive data only)

2. **Send Confirmation Modal** (`/components/modals/SendConfirmModal.tsx`):
   - Recipient list review
   - Email details summary
   - Send progress tracking
   - Batch send status

3. **Template Upload Modal** (`/components/modals/TemplateUploadModal.tsx`):
   - Multiple file upload
   - Template validation results
   - Upload progress indication
   - Error handling for invalid templates

**Deliverables:**
- Complete set of React components replacing all UI elements
- Tailwind CSS styling matching current design
- Component storybook or documentation
- Responsive design implementation

**Success Criteria:**
- All UI components render correctly
- Components are properly typed with TypeScript
- Responsive design works on mobile/tablet/desktop
- No visual regressions from current application

### Phase 3: State Management and Logic Migration
**Objective**: Convert JavaScript application logic to Zustand stores and React hooks

**AI Agent Tasks:**
1. **Zustand Stores**:
   - `useTemplateStore` - template management state with actions
   - `useEmailStore` - composition and sending state with actions
   - `useConfigStore` - application configuration state
   - `useNotificationStore` - alerts and messages state

2. **Custom Hooks**:
   - `useTemplateManager` - drag-and-drop, storage, validation (consuming template store)
   - `useEmailSender` - batch sending, progress tracking (consuming email store)
   - `useRecipientParser` - email validation and parsing
   - `useLocalStorage` - safe local storage operations
   - `useApiClient` - API communication with error handling

3. **Utility Functions Migration**:
   - Convert existing utility functions to TypeScript
   - Implement email validation logic
   - Port template sanitization functions
   - Migrate file reading and processing logic

**Sub-Phase 3A: Template Management Store**
- Create `useTemplateStore` with Zustand for template state
- Implement actions: addTemplate, removeTemplate, selectTemplate, validateTemplate
- Convert template storage logic to Zustand store
- Implement drag-and-drop with React DnD or similar
- Port template validation and sanitization
- Handle template preview generation

**Sub-Phase 3B: Email Composition Store**
- Create `useEmailStore` with Zustand for email composition state
- Implement actions: setRecipients, setSubject, setSender, validateEmail
- Migrate recipient parsing and validation
- Implement subject line and content management
- Port email preview logic
- Handle form validation and error states

**Sub-Phase 3C: Configuration Management Store**
- Create `useConfigStore` with Zustand for app configuration
- Implement secure API key handling (following ADR-002) - non-persistent
- Port sender configuration logic
- Handle application settings (excluding sensitive data)
- Implement configuration validation

**Sub-Phase 3D: Notification Management Store**
- Create `useNotificationStore` with Zustand for basic notifications
- Implement actions: addNotification, removeNotification, clearAll
- Handle different notification types (success, error, warning, info)
- Basic notification state management (preparation for toast implementation)

**Deliverables:**
- Complete Zustand state management system
- Custom hooks for all major functionality
- TypeScript interfaces for all data structures
- Error boundaries and error handling

**Success Criteria:**
- All application logic works identically to current version
- State updates trigger proper UI re-renders with Zustand
- No memory leaks or performance issues
- Proper error handling throughout application
- Store actions are properly typed and tested

### Phase 4: API Route Migration
**Objective**: Convert Express.js server endpoints to Next.js API routes

**AI Agent Tasks:**
1. **API Route Structure**:
   - `/api/send-email` - main email sending endpoint
   - `/api/validate-template` - HTML template validation
   - `/api/health` - health check endpoint
   - `/api/config/validate` - API key validation

2. **Email Sending API** (`/pages/api/send-email.ts`):
   - Port existing Express.js logic
   - Implement request validation middleware
   - Add rate limiting and security headers
   - Maintain batch processing capability
   - Preserve error handling and logging

3. **Template Validation API** (`/pages/api/validate-template.ts`):
   - HTML sanitization endpoint
   - Template structure validation
   - Security scanning for malicious content
   - Preview generation assistance

4. **Configuration API** (`/pages/api/config/validate.ts`):
   - API key validation against Resend
   - Domain verification checks
   - Configuration testing endpoint

**Migration Considerations:**
- Preserve all existing security measures
- Maintain CORS handling for client requests
- Keep request/response formats identical
- Implement proper TypeScript typing for API routes

**Deliverables:**
- Complete Next.js API routes replacing Express.js server
- Proper request/response typing
- Security middleware implementation
- API documentation

**Success Criteria:**
- All API endpoints function identically to Express.js version
- Proper error handling and validation
- Security measures maintained or improved
- No breaking changes to client-side API calls

### Phase 5: Toast Notification System
**Objective**: Implement modern toast notification system with animations and accessibility

**AI Agent Tasks:**
1. **Toast Component Development**:
   - Create `Toast` component with Tailwind CSS animations
   - Implement different toast variants (success, error, warning, info)
   - Add slide-in/slide-out animations with CSS transitions
   - Include progress bars for auto-dismiss timers

2. **Toast Container and Provider**:
   - Create `ToastContainer` component for positioning and layout
   - Implement `ToastProvider` to wrap the application
   - Handle toast stacking and positioning (top-right, bottom-right, etc.)
   - Manage z-index layering for proper display

3. **Enhanced Notification Store**:
   - Extend `useNotificationStore` with toast-specific actions
   - Add `showToast`, `dismissToast`, `clearAllToasts` actions
   - Implement auto-dismiss functionality with configurable timing
   - Add toast persistence options for critical notifications

4. **Accessibility Features**:
   - Implement proper ARIA labels and roles
   - Add keyboard navigation support (Escape to dismiss)
   - Screen reader announcements for new toasts
   - Respect user's reduced motion preferences

5. **Integration with Application**:
   - Replace existing alert/notification calls with toast system
   - Integrate with email sending progress notifications
   - Add toast notifications for template upload success/failure
   - Implement validation error toasts for form inputs

**Sub-Phase 5A: Core Toast Components**
- Design and implement base Toast component with variants
- Create ToastContainer for layout management
- Implement basic show/hide animations
- Add proper TypeScript interfaces

**Sub-Phase 5B: Advanced Features**
- Add progress bars and auto-dismiss timers
- Implement toast action buttons (Undo, Retry, etc.)
- Create toast grouping and bundling for similar messages
- Add sound notifications (optional, user-configurable)

**Sub-Phase 5C: Application Integration**
- Replace all existing notification patterns with toast system
- Add contextual toasts for user actions
- Implement batch operation progress toasts
- Create toast notifications for API errors and successes

**Deliverables:**
- Complete toast notification system with animations
- Accessible toast components with proper ARIA support
- Enhanced notification store with toast management
- Full application integration replacing old notification patterns

**Success Criteria:**
- Toasts display correctly with smooth animations
- Accessibility guidelines met (WCAG 2.1 AA)
- No performance impact from toast animations
- All user actions provide appropriate toast feedback
- Toast system is fully integrated across the application

### Phase 6: Testing and Optimization
**Objective**: Ensure application quality and optimize performance

**AI Agent Tasks:**
1. **Unit Testing**:
   - Component testing with React Testing Library
   - Hook testing for custom hooks
   - Utility function testing
   - API route testing

2. **Integration Testing**:
   - End-to-end email sending flow
   - Template upload and management
   - Configuration and settings management
   - Error handling scenarios

3. **Performance Optimization**:
   - Code splitting for optimal bundle size
   - Image optimization for template previews
   - Lazy loading for heavy components
   - API response caching strategies

4. **Accessibility Improvements**:
   - ARIA labels and roles
   - Keyboard navigation support
   - Screen reader compatibility
   - Focus management in modals

**Deliverables:**
- Comprehensive test suite
- Performance optimization implementation
- Accessibility compliance
- Documentation updates

**Success Criteria:**
- 90%+ test coverage
- All tests passing consistently
- Performance metrics equal or better than current app
- WCAG 2.1 AA compliance

## Technical Specifications

### Directory Structure
```
html-emailer-nextjs/
├── components/
│   ├── ui/           # Reusable UI components
│   ├── modals/       # Modal components
│   ├── panels/       # Main panel components
│   └── layout/       # Layout components
├── stores/           # Zustand state stores
├── hooks/            # Custom React hooks
├── lib/             # Utility functions
├── pages/
│   ├── api/         # Next.js API routes
│   └── index.tsx    # Main application page
├── types/           # TypeScript type definitions
├── utils/           # Helper functions
└── styles/          # Global styles and Tailwind config
```

### Component Design Patterns

**Modal Pattern:**
```typescript
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  // Implementation with Tailwind styling
};
```

**Panel Pattern:**
```typescript
interface PanelProps {
  title: string;
  className?: string;
  children: React.ReactNode;
}

const Panel: React.FC<PanelProps> = ({ title, className, children }) => {
  // Implementation with consistent styling
};
```

### Zustand Store Patterns

**Template Store:**
```typescript
interface Template {
  id: string;
  name: string;
  content: string;
  size: number;
  dateAdded: string;
  preview?: string;
}

interface TemplateState {
  templates: Template[];
  selectedTemplate: Template | null;
  isLoading: boolean;
  error: string | null;
}

interface TemplateActions {
  addTemplate: (template: Omit<Template, 'id'>) => void;
  removeTemplate: (id: string) => void;
  selectTemplate: (id: string) => void;
  validateTemplate: (content: string) => Promise<boolean>;
  clearError: () => void;
}

type TemplateStore = TemplateState & TemplateActions;

const useTemplateStore = create<TemplateStore>((set, get) => ({
  // State
  templates: [],
  selectedTemplate: null,
  isLoading: false,
  error: null,
  
  // Actions
  addTemplate: (template) => set((state) => ({
    templates: [...state.templates, { ...template, id: generateId() }]
  })),
  
  removeTemplate: (id) => set((state) => ({
    templates: state.templates.filter(t => t.id !== id),
    selectedTemplate: state.selectedTemplate?.id === id ? null : state.selectedTemplate
  })),
  
  selectTemplate: (id) => set((state) => ({
    selectedTemplate: state.templates.find(t => t.id === id) || null
  })),
  
  validateTemplate: async (content) => {
    set({ isLoading: true, error: null });
    try {
      // Template validation logic
      const isValid = await validateHtmlTemplate(content);
      set({ isLoading: false });
      return isValid;
    } catch (error) {
      set({ isLoading: false, error: error.message });
      return false;
    }
  },
  
  clearError: () => set({ error: null })
}));
```

**Email Store:**
```typescript
interface EmailState {
  recipients: string[];
  subject: string;
  fromEmail: string;
  fromName: string;
  isSending: boolean;
  sendProgress: number;
  error: string | null;
}

interface EmailActions {
  setRecipients: (recipients: string[]) => void;
  setSubject: (subject: string) => void;
  setSender: (email: string, name: string) => void;
  sendEmail: (apiKey: string, template: Template) => Promise<void>;
  reset: () => void;
}

type EmailStore = EmailState & EmailActions;

const useEmailStore = create<EmailStore>((set, get) => ({
  // State
  recipients: [],
  subject: '',
  fromEmail: '',
  fromName: '',
  isSending: false,
  sendProgress: 0,
  error: null,
  
  // Actions
  setRecipients: (recipients) => set({ recipients }),
  setSubject: (subject) => set({ subject }),
  setSender: (email, name) => set({ fromEmail: email, fromName: name }),
  
  sendEmail: async (apiKey, template) => {
    set({ isSending: true, sendProgress: 0, error: null });
    try {
      // Email sending logic with progress updates
      await sendBatchEmails(get().recipients, get().subject, template.content, 
        (progress) => set({ sendProgress: progress })
      );
      set({ isSending: false, sendProgress: 100 });
    } catch (error) {
      set({ isSending: false, error: error.message });
    }
  },
  
  reset: () => set({
    recipients: [],
    subject: '',
    sendProgress: 0,
    error: null
  })
}));
```

**Toast Notification Store:**
```typescript
interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message?: string;
  duration?: number;
  dismissible?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  timestamp: number;
}

interface ToastState {
  toasts: Toast[];
  maxToasts: number;
}

interface ToastActions {
  showToast: (toast: Omit<Toast, 'id' | 'timestamp'>) => void;
  dismissToast: (id: string) => void;
  clearAllToasts: () => void;
  showSuccess: (title: string, message?: string) => void;
  showError: (title: string, message?: string) => void;
  showWarning: (title: string, message?: string) => void;
  showInfo: (title: string, message?: string) => void;
}

type ToastStore = ToastState & ToastActions;

const useToastStore = create<ToastStore>((set, get) => ({
  // State
  toasts: [],
  maxToasts: 5,
  
  // Actions
  showToast: (toastData) => {
    const toast: Toast = {
      ...toastData,
      id: generateId(),
      timestamp: Date.now(),
      duration: toastData.duration ?? 5000,
      dismissible: toastData.dismissible ?? true
    };
    
    set((state) => {
      const newToasts = [...state.toasts, toast];
      // Limit number of toasts
      if (newToasts.length > state.maxToasts) {
        newToasts.shift(); // Remove oldest toast
      }
      return { toasts: newToasts };
    });
    
    // Auto-dismiss if duration is set
    if (toast.duration && toast.duration > 0) {
      setTimeout(() => {
        get().dismissToast(toast.id);
      }, toast.duration);
    }
  },
  
  dismissToast: (id) => set((state) => ({
    toasts: state.toasts.filter(toast => toast.id !== id)
  })),
  
  clearAllToasts: () => set({ toasts: [] }),
  
  // Convenience methods
  showSuccess: (title, message) => get().showToast({ type: 'success', title, message }),
  showError: (title, message) => get().showToast({ type: 'error', title, message, duration: 0 }), // Errors don't auto-dismiss
  showWarning: (title, message) => get().showToast({ type: 'warning', title, message }),
  showInfo: (title, message) => get().showToast({ type: 'info', title, message })
}));
```

### Tailwind Configuration
```javascript
// tailwind.config.js
module.exports = {
  content: ['./pages/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#2e6e8a',
        secondary: '#1aa7e3',
        accent: '#7bd1c6',
        dark: '#224f63',
        light: '#d0f0f6',
      },
    },
  },
  plugins: [],
};
```

## Alternatives Considered

### 1. React Context API for State Management (Rejected)
- **Pros**: Built into React, no additional dependencies
- **Cons**: Performance issues with frequent updates, complex provider nesting, verbose boilerplate
- **Decision**: Zustand provides better performance and simpler API for complex state

### 2. Redux Toolkit for State Management (Rejected)
- **Pros**: Mature ecosystem, excellent DevTools, predictable state updates
- **Cons**: Heavy boilerplate, steep learning curve, overkill for this application size
- **Decision**: Zustand offers simpler syntax while maintaining TypeScript support

### 3. Gradual Migration with Micro-frontends (Rejected)
- **Pros**: Could maintain existing functionality during migration
- **Cons**: Added complexity, inconsistent user experience
- **Decision**: Full migration provides cleaner architecture

### 4. Vue.js + Nuxt.js (Rejected)
- **Pros**: Similar benefits to React/Next.js
- **Cons**: React has larger ecosystem and better TypeScript support
- **Decision**: React ecosystem is more mature for this use case

### 5. Svelte/SvelteKit (Rejected)
- **Pros**: Smaller bundle size, great performance
- **Cons**: Smaller ecosystem, less AI agent tooling available
- **Decision**: Next.js has better tooling for AI-assisted development

### State Management Decision Rationale

**Why Zustand over React Context:**
- **Performance**: Zustand doesn't cause unnecessary re-renders across the component tree
- **Simplicity**: Less boilerplate than Context API with multiple providers
- **TypeScript Support**: Excellent TypeScript integration with automatic type inference
- **Developer Experience**: Simpler debugging and testing compared to Context API
- **Bundle Size**: Lightweight (~2.8kb) compared to Redux (~20kb+)
- **Learning Curve**: Minimal API surface, easy for AI agents to implement correctly

**Why Zustand over Redux Toolkit:**
- **Boilerplate**: No actions, reducers, or complex setup required
- **Bundle Size**: Significantly smaller footprint
- **Simplicity**: Direct state mutations with Immer-like syntax
- **Learning Curve**: Much simpler for this application's complexity level
- **AI Development**: Easier patterns for AI agents to implement and maintain

## Benefits

### Developer Experience
- **Hot Reload**: Instant feedback during development
- **Type Safety**: Catch errors at compile time
- **Modern Tooling**: ESLint, Prettier, and debugging tools
- **Component Reusability**: Easier to maintain and extend

### Performance
- **Code Splitting**: Automatic optimization of bundle size
- **SSR/SSG Capabilities**: Better initial load performance
- **Optimized Images**: Automatic image optimization
- **Tree Shaking**: Eliminate unused code

### Maintainability
- **Component Isolation**: Easier to test and modify individual components
- **Clear Dependencies**: Explicit imports and dependencies
- **Consistent Styling**: Tailwind prevents CSS conflicts
- **Better Error Handling**: React error boundaries
- **Zustand State Management**: Simple, performant state updates without boilerplate

### Scalability
- **Modular Architecture**: Easy to add new features
- **API Routes**: Scalable backend architecture
- **Zustand Stores**: Predictable, performant state management
- **Testing Infrastructure**: Easy to test individual components and stores
## Conclusion

Migrating to Next.js, React, Zustand, and Tailwind CSS will significantly improve the application's maintainability, developer experience, and scalability while preserving all existing functionality. The phased approach optimized for AI agent development ensures a smooth transition with minimal risk.

The component-based architecture with modern toast notifications will make future feature development faster and more reliable, while the modern tooling stack will improve the overall development experience. The Zustand state management provides a clean, performant solution for complex application state, and the toast notification system enhances user experience with immediate feedback.

The migration preserves the current security model and functionality while providing a foundation for advanced features including real-time user feedback, progress tracking, and enhanced error handling.

**Recommendation**: Proceed with the migration using the phased approach outlined above, beginning with Phase 1 manual setup followed by AI agent-driven development phases. The toast notification system in Phase 5 will provide immediate user experience improvements that justify the additional development time.
