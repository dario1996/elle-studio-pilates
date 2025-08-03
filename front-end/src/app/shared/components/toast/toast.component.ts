import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastData {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  dismissible?: boolean;
  actions?: ToastAction[];
}

export interface ToastAction {
  label: string;
  action: () => void;
  style?: 'primary' | 'secondary';
}

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="radix-toast-item"
      [class]="getToastClasses()"
      role="alert"
      [attr.aria-live]="toast.type === 'error' ? 'assertive' : 'polite'"
      [attr.aria-labelledby]="toast.title ? 'toast-title-' + toast.id : null"
      [attr.aria-describedby]="'toast-message-' + toast.id"
    >
      <!-- Type indicator -->
      <div class="toast-indicator" [class]="'indicator-' + toast.type"></div>
      
      <!-- Icon -->
      <div class="toast-icon">
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          stroke-width="2"
        >
          <path *ngIf="toast.type === 'success'" 
                stroke-linecap="round" 
                stroke-linejoin="round" 
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          <path *ngIf="toast.type === 'error'" 
                stroke-linecap="round" 
                stroke-linejoin="round" 
                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          <path *ngIf="toast.type === 'warning'" 
                stroke-linecap="round" 
                stroke-linejoin="round" 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          <path *ngIf="toast.type === 'info'" 
                stroke-linecap="round" 
                stroke-linejoin="round" 
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      
      <!-- Content -->
      <div class="toast-content">
        <div 
          *ngIf="toast.title" 
          class="toast-title"
          [id]="'toast-title-' + toast.id"
        >
          {{ toast.title }}
        </div>
        <div 
          class="toast-message"
          [id]="'toast-message-' + toast.id"
        >
          {{ toast.message }}
        </div>
        
        <!-- Actions -->
        <div *ngIf="toast.actions && toast.actions.length > 0" class="toast-actions">
          <button 
            *ngFor="let action of toast.actions"
            type="button"
            class="toast-action-btn"
            [class]="getActionClass(action.style)"
            (click)="handleAction(action)"
          >
            {{ action.label }}
          </button>
        </div>
      </div>
      
      <!-- Dismiss button -->
      <button 
        *ngIf="toast.dismissible !== false"
        type="button"
        class="toast-dismiss"
        (click)="dismiss()"
        aria-label="Dismiss notification"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  `,
  styles: [`
    .radix-toast-item {
      background: var(--color-background) !important;
      border: 1px solid var(--color-border) !important;
      border-radius: var(--radius-md) !important;
      box-shadow: var(--shadow-sm) !important;
      padding: 16px !important;
      margin-bottom: 12px !important;
      position: relative !important;
      overflow: hidden !important;
      min-height: auto !important;
      max-height: none !important;
      word-wrap: break-word !important;
      font-size: var(--font-size-sm) !important;
      line-height: 1.5 !important;
      width: 100% !important;
      display: flex !important;
      align-items: flex-start !important;
      gap: 12px !important;
      /* Remove all animations and transitions */
      animation: none !important;
      transform: none !important;
      transition: none !important;
    }

    .toast-indicator {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 3px;
      background: var(--color-muted-foreground) !important;
    }

    .toast-icon {
      flex-shrink: 0;
      width: 16px;
      height: 16px;
      margin-top: 2px;
      color: var(--color-muted-foreground) !important;
    }

    .toast-icon svg {
      width: 100%;
      height: 100%;
    }

    .toast-content {
      flex: 1;
      min-width: 0;
    }

    .toast-title {
      font-weight: 600;
      font-size: var(--font-size-sm);
      color: var(--color-foreground);
      margin: 0 0 4px 0;
      line-height: 1.4;
      letter-spacing: -0.025em;
    }

    .toast-message {
      font-size: var(--font-size-sm);
      color: var(--color-muted-foreground);
      margin: 0;
      line-height: 1.5;
      opacity: 0.9;
    }

    .toast-actions {
      display: flex;
      gap: 8px;
      margin-top: 12px;
    }

    .toast-action-btn {
      padding: 4px 8px;
      border-radius: var(--radius-sm);
      border: none;
      font-size: var(--font-size-xs);
      font-weight: 500;
      cursor: pointer;
      transition: none !important;
    }

    .toast-action-btn.primary {
      background: var(--color-primary);
      color: var(--color-primary-foreground);
    }

    .toast-action-btn.secondary {
      background: var(--color-secondary);
      color: var(--color-secondary-foreground);
    }

    .toast-dismiss {
      flex-shrink: 0;
      width: 24px;
      height: 24px;
      border: none;
      background: none;
      cursor: pointer;
      border-radius: var(--radius-sm);
      display: flex;
      align-items: center;
      justify-content: center;
      color: var(--color-muted-foreground);
      transition: none !important;
    }

    .toast-dismiss:focus-visible {
      outline: 2px solid var(--color-primary) !important;
      outline-offset: 2px !important;
    }

    .radix-toast-item:hover {
      box-shadow: var(--shadow-lg);
      transform: translateY(-1px);
      transition: all 0.2s ease;
    }

    .radix-toast-item:focus-visible {
      outline: 2px solid var(--color-primary) !important;
      outline-offset: 2px !important;
    }
  `]
})
export class ToastComponent implements OnInit, OnDestroy {
  @Input() toast!: ToastData;
  @Output() dismissed = new EventEmitter<string>();
  
  private timeoutId?: number;

  ngOnInit() {
    if (this.toast.duration && this.toast.duration > 0) {
      this.timeoutId = window.setTimeout(() => {
        this.dismiss();
      }, this.toast.duration);
    }
  }

  ngOnDestroy() {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }
  }

  getToastClasses(): string {
    return `toast-${this.toast.type}`;
  }

  getActionClass(style?: string): string {
    return style === 'primary' ? 'primary' : 'secondary';
  }

  handleAction(action: ToastAction) {
    action.action();
    this.dismiss();
  }

  dismiss() {
    this.dismissed.emit(this.toast.id);
  }
}
