import { ToastType } from './ToastType';

export interface ToastConfig {
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
  dismissible?: boolean;
  progressBar?: boolean;
  icon?: string;
  action?: {
    text: string;
    callback: () => void;
  };
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  customClass?: string;
}