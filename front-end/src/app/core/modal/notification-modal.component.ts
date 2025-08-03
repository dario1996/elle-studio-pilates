import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-notification-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="isOpen"
      class="modal"
      style="display: block; z-index: 1070;"
      tabindex="-1"
      role="dialog"
    >
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header" [ngClass]="getHeaderClass()">
            <h5 class="modal-title text-white">
              <i [class]="getIconClass()" class="me-2"></i>
              {{ title }}
            </h5>
            <button
              type="button"
              class="btn-close btn-close-white"
              aria-label="Close"
              (click)="onClose()"
            ></button>
          </div>
          <div class="modal-body">
            <div class="text-center">
              <i
                [class]="getBodyIconClass()"
                class="mb-3"
                style="font-size: 3rem;"
              ></i>
              <p class="lead">{{ message }}</p>
              <p *ngIf="details" class="text-muted">{{ details }}</p>
            </div>
          </div>
          <div class="modal-footer d-flex justify-content-center">
            <button
              type="button"
              [class]="getButtonClass()"
              (click)="onClose()"
            >
              {{ buttonText }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <div
      *ngIf="isOpen"
      class="modal-backdrop fade show"
      style="z-index: 1060;"
    ></div>
  `,
  styles: [
    `
      .modal-dialog-centered {
        display: flex;
        align-items: center;
        min-height: calc(100% - 1rem);
      }
      .btn-close-white {
        filter: invert(1) grayscale(100%) brightness(200%);
      }
    `,
  ],
})
export class NotificationModalComponent {
  @Input() isOpen: boolean = false;
  @Input() title: string = 'Notifica';
  @Input() message: string = '';
  @Input() details: string = '';
  @Input() type: 'success' | 'error' | 'warning' | 'info' = 'info';
  @Input() buttonText: string = 'OK';

  @Output() closed = new EventEmitter<void>();

  onClose() {
    this.closed.emit();
  }

  getHeaderClass(): string {
    const classes = {
      success: 'bg-success',
      error: 'bg-danger',
      warning: 'bg-warning',
      info: 'bg-info',
    };
    return classes[this.type] || classes['info'];
  }

  getIconClass(): string {
    const icons = {
      success: 'fa-solid fa-check-circle',
      error: 'fa-solid fa-times-circle',
      warning: 'fa-solid fa-exclamation-triangle',
      info: 'fa-solid fa-info-circle',
    };
    return icons[this.type] || icons['info'];
  }

  getBodyIconClass(): string {
    const icons = {
      success: 'fa-solid fa-check-circle text-success',
      error: 'fa-solid fa-times-circle text-danger',
      warning: 'fa-solid fa-exclamation-triangle text-warning',
      info: 'fa-solid fa-info-circle text-info',
    };
    return icons[this.type] || icons['info'];
  }

  getButtonClass(): string {
    const classes = {
      success: 'btn btn-success px-4',
      error: 'btn btn-danger px-4',
      warning: 'btn btn-warning px-4',
      info: 'btn btn-info px-4',
    };
    return classes[this.type] || classes['info'];
  }
}
