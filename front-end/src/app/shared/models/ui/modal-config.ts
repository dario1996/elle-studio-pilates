import { Type } from "@angular/core";

export interface IModalButton {
  text: string;
  cssClass: string;
  action: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export interface IModaleConfig {
  titolo: string;
  componente: Type<any>;
  dati?: any;
  onConferma?: (formValue: any) => void;
  dimensione?: string;
  showCloseButton?: boolean; // New option to control close button visibility
  customButtons?: IModalButton[]; // Array of custom buttons
  showDefaultButtons?: boolean; // Show default Chiudi/Conferma buttons (default: true)
}