export interface IUtenteAutocomplete {
  username: string;
  nome?: string;
  cognome?: string;
  email: string;
  
  // Campi calcolati
  nominativo?: string;
  displayText?: string;
}
