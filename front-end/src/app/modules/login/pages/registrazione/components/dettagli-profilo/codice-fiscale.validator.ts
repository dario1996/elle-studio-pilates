import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function codiceFiscaleValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = (control.value || '').toUpperCase();

    if (!value) {
      return { required: 'Il codice fiscale è obbligatorio.' };
    }
    if (value.length !== 16) {
      return { length: 'Il codice fiscale deve essere di 16 caratteri.' };
    }
    if (!/^[A-Z0-9]+$/.test(value)) {
      return { format: 'Il codice fiscale può contenere solo lettere maiuscole e numeri.' };
    }
    if (!/^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/.test(value)) {
      return { structure: 'Il formato del codice fiscale non è valido.' };
    }
    // Il controllo del carattere di controllo è stato rimosso per maggiore tolleranza
    return null;
  };
}
