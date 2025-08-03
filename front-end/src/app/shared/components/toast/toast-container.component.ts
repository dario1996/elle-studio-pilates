import { Component, Injectable, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { ToastComponent, ToastData } from './toast.component';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toasts: ToastData[] = [];
  private toastSubject = new Subject<ToastData[]>();
  
  toasts$ = this.toastSubject.asObservable();

  private generateId(): string {
    return `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  show(toast: Omit<ToastData, 'id'>): string {
    const id = this.generateId();
    const newToast: ToastData = {
      id,
      duration: toast.duration ?? 4000,
      dismissible: toast.dismissible ?? true,
      ...toast
    };
    
    this.toasts.push(newToast);
    this.toastSubject.next([...this.toasts]);
    
    return id;
  }

  success(message: string, title?: string, options?: Partial<ToastData>): string {
    return this.show({
      type: 'success',
      title,
      message,
      duration: 3000,
      ...options
    });
  }

  error(message: string, title?: string, options?: Partial<ToastData>): string {
    return this.show({
      type: 'error',
      title,
      message,
      duration: 5000,
      ...options
    });
  }

  warning(message: string, title?: string, options?: Partial<ToastData>): string {
    return this.show({
      type: 'warning',
      title,
      message,
      duration: 4000,
      ...options
    });
  }

  info(message: string, title?: string, options?: Partial<ToastData>): string {
    return this.show({
      type: 'info',
      title,
      message,
      duration: 3000,
      ...options
    });
  }

  dismiss(id: string): void {
    this.toasts = this.toasts.filter(toast => toast.id !== id);
    this.toastSubject.next([...this.toasts]);
  }

  dismissAll(): void {
    this.toasts = [];
    this.toastSubject.next([]);
  }
}

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule, ToastComponent],
  template: `
    <div class="toast-container" [attr.aria-live]="'polite'" [attr.aria-atomic]="'false'">
      <app-toast
        *ngFor="let toast of toasts; trackBy: trackByToastId"
        [toast]="toast"
        (dismissed)="onToastDismissed($event)"
      ></app-toast>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 356px;
      max-width: calc(100vw - 48px);
      z-index: 9999;
      pointer-events: none;
    }

    .toast-container > * {
      pointer-events: auto;
    }

    @media (max-width: 768px) {
      .toast-container {
        bottom: 16px;
        right: 16px;
        left: 16px;
        width: auto;
        max-width: none;
      }
    }
  `]
})
export class ToastContainerComponent implements OnDestroy {
  toasts: ToastData[] = [];
  private destroy$ = new Subject<void>();

  constructor(private toastService: ToastService) {
    this.toastService.toasts$
      .pipe(takeUntil(this.destroy$))
      .subscribe(toasts => {
        this.toasts = toasts;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onToastDismissed(toastId: string): void {
    this.toastService.dismiss(toastId);
  }

  trackByToastId(index: number, toast: ToastData): string {
    return toast.id;
  }
}
