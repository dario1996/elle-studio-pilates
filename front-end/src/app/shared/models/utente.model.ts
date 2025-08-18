export interface Utente {
  id?: number;
  username: string;
  email: string;
  password?: string;
  nome?: string;
  cognome?: string;
  codiceFiscale?: string;
  ruoli: string[];
  attivo: string;
  flagPrivacy?: string;
  certificatoMedico?: string;
  patologie?: boolean;
  descrizionePatologie?: string;
  obiettivi?: string;
  dataCreazione?: Date;
  dataModifica?: Date;
  confirmPassword?: string;
  
  // Campi calcolati per la visualizzazione
  nominativo?: string;
}
