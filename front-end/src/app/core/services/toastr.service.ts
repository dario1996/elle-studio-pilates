import { Injectable } from '@angular/core';
import { ToastrService as NgxToastrService, IndividualConfig } from 'ngx-toastr';

export interface ToastOptions {
  duration?: number;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  dismissible?: boolean;
  progressBar?: boolean;
  pauseOnHover?: boolean;
  preventDuplicates?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ToastrService {
  constructor(private toastr: NgxToastrService) {}

  private getConfig(options?: ToastOptions): Partial<IndividualConfig> {
    return {
      timeOut: options?.duration || 4000,
      positionClass: this.getPositionClass(options?.position || 'bottom-right'),
      closeButton: options?.dismissible ?? false,
      progressBar: options?.progressBar ?? false,
      disableTimeOut: options?.duration === 0,
      extendedTimeOut: options?.pauseOnHover ? 1000 : 0,
      tapToDismiss: true,
      toastClass: 'radix-toast',
      titleClass: 'radix-toast-title',
      messageClass: 'radix-toast-message',
      enableHtml: false,
      // Disable all animations
      easeTime: 0,
      easing: 'linear'
    };
  }

  private getPositionClass(position: string): string {
    const positions: { [key: string]: string } = {
      'top-right': 'toast-top-right',
      'top-left': 'toast-top-left',
      'bottom-right': 'toast-bottom-right',
      'bottom-left': 'toast-bottom-left',
      'top-center': 'toast-top-center',
      'bottom-center': 'toast-bottom-center',
    };
    return positions[position] || 'toast-bottom-right';
  }

  success(message: string, title?: string, options?: ToastOptions) {
    const config = this.getConfig(options);
    config.toastClass = `${config.toastClass} radix-toast-success`;
    this.toastr.success(message, title, config);
  }

  error(message: string, title?: string, options?: ToastOptions) {
    const config = this.getConfig(options);
    config.toastClass = `${config.toastClass} radix-toast-error`;
    this.toastr.error(message, title, config);
  }

  warning(message: string, title?: string, options?: ToastOptions) {
    const config = this.getConfig(options);
    config.toastClass = `${config.toastClass} radix-toast-warning`;
    this.toastr.warning(message, title, config);
  }

  info(message: string, title?: string, options?: ToastOptions) {
    const config = this.getConfig(options);
    config.toastClass = `${config.toastClass} radix-toast-info`;
    this.toastr.info(message, title, config);
  }

  // Convenience methods for common patterns
  showSuccess(message: string, title = 'Success') {
    this.success(message, title, { duration: 3000 });
  }

  showError(message: string, title = 'Error') {
    this.error(message, title, { duration: 5000 });
  }

  showWarning(message: string, title = 'Warning') {
    this.warning(message, title, { duration: 4000 });
  }

  showInfo(message: string, title = 'Info') {
    this.info(message, title, { duration: 3000 });
  }

  // Clear all toasts
  clear() {
    this.toastr.clear();
  }
}
