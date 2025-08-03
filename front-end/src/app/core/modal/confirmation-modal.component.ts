import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="isOpen"
      class="modal"
      style="display: block; z-index: 1080;"
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
              (click)="onCancel()"
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
          <div class="modal-footer d-flex justify-content-center gap-3">
            <button
              type="button"
              class="btn btn-secondary px-4"
              (click)="onCancel()"
              [disabled]="isProcessing"
            >
              {{ cancelText }}
            </button>
            <button
              type="button"
              [class]="getConfirmButtonClass()"
              (click)="onConfirm()"
              [disabled]="isProcessing"
            >
              <span
                *ngIf="isProcessing"
                class="spinner-border spinner-border-sm me-2"
                role="status"
              ></span>
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <div
      *ngIf="isOpen"
      class="modal-backdrop fade show"
      style="z-index: 1070;"
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
export class ConfirmationModalComponent {
  @Input() isOpen: boolean = false;
  @Input() title: string = 'Conferma';
  @Input() message: string = 'Sei sicuro di voler procedere?';
  @Input() details: string = '';
  @Input() type: 'danger' | 'warning' | 'info' | 'success' = 'warning';
  @Input() confirmText: string = 'Conferma';
  @Input() cancelText: string = 'Annulla';
  @Input() isProcessing: boolean = false;

  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  onConfirm() {
    this.confirmed.emit();
  }

  onCancel() {
    this.cancelled.emit();
  }

  getHeaderClass(): string {
    const classes = {
      danger: 'bg-danger',
      warning: 'bg-warning',
      info: 'bg-info',
      success: 'bg-success',
    };
    return classes[this.type] || classes['warning'];
  }

  getIconClass(): string {
    const icons = {
      danger: 'fa-solid fa-triangle-exclamation',
      warning: 'fa-solid fa-exclamation-triangle',
      info: 'fa-solid fa-info-circle',
      success: 'fa-solid fa-check-circle',
    };
    return icons[this.type] || icons['warning'];
  }

  getBodyIconClass(): string {
    const icons = {
      danger: 'fa-solid fa-triangle-exclamation text-danger',
      warning: 'fa-solid fa-exclamation-triangle text-warning',
      info: 'fa-solid fa-info-circle text-info',
      success: 'fa-solid fa-check-circle text-success',
    };
    return icons[this.type] || icons['warning'];
  }

  getConfirmButtonClass(): string {
    const classes = {
      danger: 'btn btn-danger px-4',
      warning: 'btn btn-warning px-4',
      info: 'btn btn-info px-4',
      success: 'btn btn-success px-4',
    };
    return classes[this.type] || classes['warning'];
  }
}
