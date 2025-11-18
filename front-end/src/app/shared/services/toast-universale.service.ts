import { Injectable, Optional, Inject } from '@angular/core';
import { ToastrService, GlobalConfig } from 'ngx-toastr';
import { ToastType } from '../models/ToastType';
import { ToastConfig } from '../models/ToastConfig';

@Injectable({
  providedIn: 'root'
})
export class ToastUniversaleService {
  private defaultConfig: Partial<ToastConfig>;

  private readonly iconMap: Record<ToastType, string> = {
    [ToastType.SUCCESS]: '✓',
    [ToastType.ERROR]: '✕',
    [ToastType.WARNING]: '⚠',
    [ToastType.INFO]: 'ℹ',
    [ToastType.CONFIRMATION]: '✓',
    [ToastType.CANCELLATION]: '↩',
    [ToastType.LOADING]: '⟳',
    [ToastType.CUSTOM]: ''
  };

  private readonly titleMap: Record<ToastType, string> = {
    [ToastType.SUCCESS]: 'Successo',
    [ToastType.ERROR]: 'Errore',
    [ToastType.WARNING]: 'Attenzione',
    [ToastType.INFO]: 'Informazione',
    [ToastType.CONFIRMATION]: 'Confermato',
    [ToastType.CANCELLATION]: 'Annullato',
    [ToastType.LOADING]: 'Caricamento...',
    [ToastType.CUSTOM]: ''
  };

  constructor(private toastr: ToastrService) {
    // Leggi la configurazione globale da ngx-toastr (definita in main.ts)
    const toastrConfig = this.toastr.toastrConfig;
    
    // Mappa la posizione da ngx-toastr al nostro formato
    const position = this.mapPositionClass(toastrConfig.positionClass || 'toast-top-center');
    
    // Inizializza la config di default usando i valori di ngx-toastr
    this.defaultConfig = {
      duration: toastrConfig.timeOut || 3000,
      dismissible: toastrConfig.closeButton !== undefined ? toastrConfig.closeButton : true,
      progressBar: toastrConfig.progressBar !== undefined ? toastrConfig.progressBar : true,
      position: position
    };
  }

  /**
   * Mappa la posizione class di ngx-toastr al formato del nostro ToastConfig
   */
  private mapPositionClass(positionClass: string | undefined): 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center' {
    const mapping: Record<string, any> = {
      'toast-top-right': 'top-right',
      'toast-top-left': 'top-left',
      'toast-bottom-right': 'bottom-right',
      'toast-bottom-left': 'bottom-left',
      'toast-top-center': 'top-center',
      'toast-bottom-center': 'bottom-center'
    };
    return mapping[positionClass || ''] || 'top-center';
  }

  show(config: ToastConfig): void {
    const finalConfig = { ...this.defaultConfig, ...config };
    const title = config.title || this.titleMap[config.type];
    const icon = config.icon || this.iconMap[config.type];
    const message = icon ? `${icon} ${config.message}` : config.message;

    const options = {
      timeOut: finalConfig.duration,
      closeButton: finalConfig.dismissible,
      progressBar: finalConfig.progressBar,
      positionClass: this.getPositionClass(finalConfig.position!),
      toastClass: `radix-toast radix-toast-${config.type.toLowerCase()} ${finalConfig.customClass || ''}`,
      titleClass: 'radix-toast-title',
      messageClass: 'radix-toast-message'
    };

    switch (config.type) {
      case ToastType.SUCCESS:
      case ToastType.CONFIRMATION:
        this.toastr.success(message, title, options);
        break;
      case ToastType.ERROR:
        this.toastr.error(message, title, { ...options, timeOut: 5000 });
        break;
      case ToastType.WARNING:
        this.toastr.warning(message, title, options);
        break;
      case ToastType.INFO:
      case ToastType.CANCELLATION:
        this.toastr.info(message, title, options);
        break;
      case ToastType.LOADING:
        this.toastr.info(message, title, { ...options, timeOut: 0, closeButton: false });
        break;
      default:
        this.toastr.show(message, title, options);
    }
  }

  success(message: string, title?: string, config?: Partial<ToastConfig>): void {
    this.show({ type: ToastType.SUCCESS, message, title, ...config });
  }

  error(message: string, title?: string, config?: Partial<ToastConfig>): void {
    this.show({ type: ToastType.ERROR, message, title, ...config });
  }

  warning(message: string, title?: string, config?: Partial<ToastConfig>): void {
    this.show({ type: ToastType.WARNING, message, title, ...config });
  }

  info(message: string, title?: string, config?: Partial<ToastConfig>): void {
    this.show({ type: ToastType.INFO, message, title, ...config });
  }

  confirmation(message: string, title?: string, config?: Partial<ToastConfig>): void {
    this.show({ type: ToastType.CONFIRMATION, message, title, ...config });
  }

  cancellation(message: string, title?: string, config?: Partial<ToastConfig>): void {
    this.show({ type: ToastType.CANCELLATION, message, title, ...config });
  }

  loading(message: string, title?: string): void {
    this.show({ type: ToastType.LOADING, message, title });
  }

  clearAll(): void {
    this.toastr.clear();
  }

  private getPositionClass(position: string): string {
    const positionMap: Record<string, string> = {
      'top-right': 'toast-top-right',
      'top-left': 'toast-top-left',
      'bottom-right': 'toast-bottom-right',
      'bottom-left': 'toast-bottom-left',
      'top-center': 'toast-top-center',
      'bottom-center': 'toast-bottom-center'
    };
    return positionMap[position] || 'toast-top-center';
  }
}