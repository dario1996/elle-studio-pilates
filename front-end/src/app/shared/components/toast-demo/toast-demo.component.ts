import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastrService } from '../../../core/services/toastr.service';
import { ToastService } from '../toast/toast-container.component';

@Component({
  selector: 'app-toast-demo',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-demo">
      <h3>Toast Examples</h3>
      
      <div class="demo-section">
        <h4>NGX-Toastr Integration</h4>
        <div class="button-group">
          <button class="btn btn-primary" (click)="showNgxSuccess()">
            Success Toast
          </button>
          <button class="btn btn-danger" (click)="showNgxError()">
            Error Toast
          </button>
          <button class="btn btn-warning" (click)="showNgxWarning()">
            Warning Toast
          </button>
          <button class="btn btn-info" (click)="showNgxInfo()">
            Info Toast
          </button>
        </div>
      </div>

      <div class="demo-section">
        <h4>Native Toast Service</h4>
        <div class="button-group">
          <button class="btn btn-primary" (click)="showNativeSuccess()">
            Success Toast
          </button>
          <button class="btn btn-danger" (click)="showNativeError()">
            Error Toast
          </button>
          <button class="btn btn-warning" (click)="showNativeWarning()">
            Warning Toast
          </button>
          <button class="btn btn-info" (click)="showNativeInfo()">
            Info Toast
          </button>
        </div>
      </div>

      <div class="demo-section">
        <h4>Advanced Examples</h4>
        <div class="button-group">
          <button class="btn btn-secondary" (click)="showWithActions()">
            Toast with Actions
          </button>
          <button class="btn btn-secondary" (click)="showPersistent()">
            Persistent Toast
          </button>
          <button class="btn btn-secondary" (click)="showCustomDuration()">
            Custom Duration
          </button>
          <button class="btn btn-danger" (click)="dismissAll()">
            Dismiss All
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .toast-demo {
      padding: 24px;
      max-width: 600px;
      margin: 0 auto;
    }

    .demo-section {
      margin-bottom: 32px;
    }

    .demo-section h4 {
      margin-bottom: 16px;
      color: var(--color-foreground);
      font-size: var(--font-size-lg);
    }

    .button-group {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }

    .btn {
      padding: 8px 16px;
      border-radius: var(--radius-md);
      border: none;
      font-size: var(--font-size-sm);
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .btn-primary {
      background: #10b981;
      color: white;
    }

    .btn-danger {
      background: #ef4444;
      color: white;
    }

    .btn-warning {
      background: #f59e0b;
      color: white;
    }

    .btn-info {
      background: #3b82f6;
      color: white;
    }

    .btn-secondary {
      background: var(--color-secondary);
      color: var(--color-secondary-foreground);
    }

    .btn:hover {
      transform: translateY(-1px);
      box-shadow: var(--shadow-md);
    }
  `]
})
export class ToastDemoComponent {
  constructor(
    private toastrService: ToastrService,
    private toastService: ToastService
  ) {}

  // NGX-Toastr examples
  showNgxSuccess() {
    this.toastrService.showSuccess('Operation completed successfully!');
  }

  showNgxError() {
    this.toastrService.showError('Something went wrong. Please try again.');
  }

  showNgxWarning() {
    this.toastrService.showWarning('Please check your input data.');
  }

  showNgxInfo() {
    this.toastrService.showInfo('New features are available!');
  }

  // Native toast service examples
  showNativeSuccess() {
    this.toastService.success('File uploaded successfully!', 'Success');
  }

  showNativeError() {
    this.toastService.error('Failed to save changes. Please try again.', 'Error');
  }

  showNativeWarning() {
    this.toastService.warning('Your session will expire in 5 minutes.', 'Warning');
  }

  showNativeInfo() {
    this.toastService.info('A new version of the app is available.', 'Update Available');
  }

  // Advanced examples
  showWithActions() {
    this.toastService.show({
      type: 'info',
      title: 'Confirm Action',
      message: 'Do you want to proceed with this action?',
      duration: 0, // Persistent
      actions: [
        {
          label: 'Yes',
          action: () => {
            this.toastService.success('Action confirmed!');
          },
          style: 'primary'
        },
        {
          label: 'No',
          action: () => {
            this.toastService.info('Action cancelled.');
          },
          style: 'secondary'
        }
      ]
    });
  }

  showPersistent() {
    this.toastService.show({
      type: 'warning',
      title: 'Persistent Toast',
      message: 'This toast will stay until you dismiss it manually.',
      duration: 0 // No auto-dismiss
    });
  }

  showCustomDuration() {
    this.toastService.show({
      type: 'info',
      title: 'Custom Duration',
      message: 'This toast will disappear after 10 seconds.',
      duration: 10000
    });
  }

  dismissAll() {
    this.toastService.dismissAll();
  }
}
