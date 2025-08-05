export interface IUsers {
  username: string;
  email: string;
  cellulare: string;
  password: string;
  attivo: string;
  flagPrivacy: string;
  ruoli: string[];
  
  // Nuovi campi per la registrazione
  nome?: string;
  cognome?: string;
  codiceFiscale?: string;
  certificatoMedico?: string;
  patologie?: boolean;
  descrizionePatologie?: string;
  obiettivi?: string;
}
