import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastrService } from '../../../core/services/toastr.service';

@Component({
  selector: 'app-toast-test',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-test-container">
      <h2>Toast System Test</h2>
      
      <div class="test-section">
        <h3>Basic Toasts</h3>
        <div class="button-group">
          <button class="test-btn success" (click)="testSuccess()">
            Success Toast
          </button>
          <button class="test-btn error" (click)="testError()">
            Error Toast
          </button>
          <button class="test-btn warning" (click)="testWarning()">
            Warning Toast
          </button>
          <button class="test-btn info" (click)="testInfo()">
            Info Toast
          </button>
        </div>
      </div>

      <div class="test-section">
        <h3>Quick Methods</h3>
        <div class="button-group">
          <button class="test-btn success" (click)="testQuickSuccess()">
            Quick Success
          </button>
          <button class="test-btn error" (click)="testQuickError()">
            Quick Error
          </button>
          <button class="test-btn warning" (click)="testQuickWarning()">
            Quick Warning
          </button>
          <button class="test-btn info" (click)="testQuickInfo()">
            Quick Info
          </button>
        </div>
      </div>

      <div class="test-section">
        <h3>With Options</h3>
        <div class="button-group">
          <button class="test-btn secondary" (click)="testWithOptions()">
            Toast with Options
          </button>
          <button class="test-btn secondary" (click)="testPersistent()">
            Persistent Toast
          </button>
          <button class="test-btn secondary" (click)="testDifferentPosition()">
            Different Position
          </button>
          <button class="test-btn danger" (click)="clearAll()">
            Clear All
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .toast-test-container {
      max-width: 800px;
      margin: 40px auto;
      padding: 24px;
      background: var(--color-background);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-lg);
    }

    .test-section {
      margin-bottom: 32px;
    }

    .test-section h3 {
      margin-bottom: 16px;
      color: var(--color-foreground);
      font-size: var(--font-size-lg);
    }

    .button-group {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }

    .test-btn {
      padding: 12px 24px;
      border: none;
      border-radius: var(--radius-md);
      font-size: var(--font-size-sm);
      font-weight: 500;
      cursor: pointer;
      transition: none;
      min-width: 120px;
    }

    .test-btn.success {
      background: #f0f9ff;
      color: #0c4a6e;
      border: 1px solid #e0e7ff;
    }

    .test-btn.error {
      background: #fef2f2;
      color: #7f1d1d;
      border: 1px solid #fecaca;
    }

    .test-btn.warning {
      background: #fffbeb;
      color: #78350f;
      border: 1px solid #fde68a;
    }

    .test-btn.info {
      background: #eff6ff;
      color: #1e3a8a;
      border: 1px solid #dbeafe;
    }

    .test-btn.secondary {
      background: var(--color-secondary);
      color: var(--color-secondary-foreground);
      border: 1px solid var(--color-border);
    }

    .test-btn.danger {
      background: #fef2f2;
      color: #7f1d1d;
      border: 1px solid #fecaca;
    }

    .test-btn:hover {
      opacity: 0.9;
    }

    .test-btn:focus-visible {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
    }
  `]
})
export class ToastTestComponent {
  constructor(private toastr: ToastrService) {}

  testSuccess() {
    this.toastr.success('Operation completed successfully!', 'Success');
  }

  testError() {
    this.toastr.error('Something went wrong. Please try again.', 'Error');
  }

  testWarning() {
    this.toastr.warning('Please check your input data.', 'Warning');
  }

  testInfo() {
    this.toastr.info('New features are available!', 'Info');
  }

  testQuickSuccess() {
    this.toastr.showSuccess('Quick success message!');
  }

  testQuickError() {
    this.toastr.showError('Quick error message!');
  }

  testQuickWarning() {
    this.toastr.showWarning('Quick warning message!');
  }

  testQuickInfo() {
    this.toastr.showInfo('Quick info message!');
  }

  testWithOptions() {
    this.toastr.success('This toast has custom options', 'Custom Options', {
      duration: 8000,
      dismissible: true,
      progressBar: false
    });
  }

  testPersistent() {
    this.toastr.warning('This toast will stay until dismissed', 'Persistent', {
      duration: 0,
      dismissible: true
    });
  }

  testDifferentPosition() {
    this.toastr.info('This toast appears at top-right', 'Different Position', {
      position: 'top-right',
      duration: 5000
    });
  }

  clearAll() {
    this.toastr.clear();
  }
}
