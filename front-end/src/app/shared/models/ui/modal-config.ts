import { Type } from "@angular/core";

export interface IModaleConfig {
  titolo: string;
  componente: Type<any>;
  dati?: any;
  onConferma?: (formValue: any) => void;
  dimensione?: string;
  showCloseButton?: boolean; // New option to control close button visibility
}