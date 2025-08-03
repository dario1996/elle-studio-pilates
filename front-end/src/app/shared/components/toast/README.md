# Toast System Documentation

## Overview

The toast system provides a clean, minimalistic notification system aligned with Radix UI design principles. It offers both NGX-Toastr integration and a native Angular toast service.

## Features

- **Radix UI-inspired design** with clean, modern styling
- **Minimalistic approach** with subtle animations and effects
- **Type-safe** with full TypeScript support
- **Accessible** with proper ARIA attributes and keyboard navigation
- **Responsive** design that works on all screen sizes
- **Flexible positioning** (top/bottom, left/right/center)
- **Action buttons** for interactive notifications
- **Persistent toasts** that don't auto-dismiss
- **Dark mode support** with CSS custom properties

## Usage

### NGX-Toastr Service (Recommended for existing code)

```typescript
import { ToastrService } from '../core/services/toastr.service';

constructor(private toastr: ToastrService) {}

// Simple usage
this.toastr.success('Operation completed!');
this.toastr.error('Something went wrong');
this.toastr.warning('Please check your input');
this.toastr.info('New features available');

// With options
this.toastr.success('Message', 'Title', {
  duration: 5000,
  position: 'top-right',
  dismissible: true,
  progressBar: true
});

// Convenience methods
this.toastr.showSuccess('Quick success message');
this.toastr.showError('Quick error message');
```

### Native Toast Service (New, more flexible)

```typescript
import { ToastService } from '../shared/components/toast/toast-container.component';

constructor(private toastService: ToastService) {}

// Simple usage
this.toastService.success('Operation completed!');
this.toastService.error('Something went wrong');

// With actions
this.toastService.show({
  type: 'info',
  title: 'Confirm Action',
  message: 'Do you want to proceed?',
  duration: 0, // Persistent
  actions: [
    {
      label: 'Yes',
      action: () => this.confirmAction(),
      style: 'primary'
    },
    {
      label: 'No',
      action: () => this.cancelAction(),
      style: 'secondary'
    }
  ]
});

// Persistent toast
this.toastService.show({
  type: 'warning',
  title: 'Important',
  message: 'This stays until dismissed',
  duration: 0
});
```

### Toast Container Setup

Add the toast container to your root component:

```typescript
// app.component.ts
import { ToastContainerComponent } from './shared/components/toast/toast-container.component';

@Component({
  selector: 'app-root',
  imports: [ToastContainerComponent],
  template: `
    <!-- Your app content -->
    <router-outlet></router-outlet>
    
    <!-- Toast container -->
    <app-toast-container></app-toast-container>
  `
})
export class AppComponent {}
```

## Toast Types

- **Success**: Green accent, check icon, for successful operations
- **Error**: Red accent, X icon, for errors and failures
- **Warning**: Yellow accent, triangle icon, for warnings
- **Info**: Blue accent, info icon, for general information

## Configuration Options

### ToastOptions Interface

```typescript
interface ToastOptions {
  duration?: number;           // Auto-dismiss time in ms (0 = persistent)
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  dismissible?: boolean;       // Show dismiss button
  progressBar?: boolean;       // Show progress bar
  pauseOnHover?: boolean;      // Pause timer on hover
  preventDuplicates?: boolean; // Prevent duplicate messages
}
```

### ToastAction Interface

```typescript
interface ToastAction {
  label: string;              // Button text
  action: () => void;         // Click handler
  style?: 'primary' | 'secondary'; // Button style
}
```

## Styling

The toast system uses CSS custom properties for theming:

```css
:root {
  --color-background: hsl(0 0% 100%);
  --color-foreground: hsl(0 0% 9%);
  --color-border: hsl(0 0% 91%);
  --color-muted-foreground: hsl(0 0% 45%);
  --color-primary: hsl(222 84% 5%);
  --radius-md: 8px;
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --font-size-sm: 0.875rem;
}
```

## Accessibility

- Proper ARIA attributes (`aria-live`, `aria-labelledby`, `aria-describedby`)
- Keyboard navigation support
- Screen reader friendly
- Focus management
- Color contrast compliant

## Browser Support

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## Migration from Old Toast System

1. Keep existing `ToastrService` usage unchanged
2. Gradually migrate to new `ToastService` for new features
3. Update styling from `minimal-toast` to `radix-toast` classes
4. Add `ToastContainerComponent` to your root component

## Examples

See `toast-demo.component.ts` for comprehensive examples of all features.

## Best Practices

1. Use appropriate toast types for the context
2. Keep messages concise and actionable
3. Use persistent toasts sparingly
4. Provide actions for important confirmations
5. Test with screen readers
6. Consider mobile experience
7. Avoid toast spam - use `preventDuplicates: true`
