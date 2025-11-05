export interface IUsers {
  id: number;
  username: string;
  email: string;
  password: string;
  attivo: string;
  flagPrivacy: string;
  ruoli: string[];
  
  // Nuovi campi per la registrazione (allineati con RegistrazioneUtenteDTO)
  nome?: string;
  cognome?: string;
  codiceFiscale?: string;
  indirizzo?: string;
  città?: string;
  telefono?: string;
  certificatoMedico?: boolean;
  patologie?: boolean;
  descrizionePatologie?: string;
  obiettivi?: string;
  dataCreazione?: string;
  
  // Campo per gestione pacchetti disponibili
  pacchettiDisponibiliIds?: number[];
  
  // Campo aggiuntivo per la conferma password (solo frontend)
  confirmPassword?: string;
}
