export interface IUsers {
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
  certificatoMedico?: string;
  patologie?: boolean;
  descrizionePatologie?: string;
  obiettivi?: string;
  
  // Campo aggiuntivo per la conferma password (solo frontend)
  confirmPassword?: string;
}
