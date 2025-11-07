export interface PrenotazioneLezioneRequest {
  lezioneId: number;
  note?: string;
  venditaId?: number;
}

export interface PrenotazioneLezioneResponse {
  id: number;
  lezioneId: number;
  titolo: string;
  dataInizio: string;
  dataFine: string;
  istruttore: string;
  tipoLezione: string;
  username: string;
  note?: string;
  stato: string;
  dataPrenotazione: string;
}

export interface LezioneDisponibile {
  lezioneId: number;
  titolo: string;
  dataInizio: string;
  dataFine: string;
  istruttore: string;
  tipoLezione: string;
  maxPartecipanti: number;
  postiOccupati: number;
  postiDisponibili: number;
  disponibile: boolean;
  giornoSettimana: string;
  note?: string;
  templateId?: number;
  colore?: string;
}

export interface TipoLezione {
  id: number;
  giornoSettimana: string;
  oraInizio: string;
  oraFine: string;
  titolo: string;
  tipoLezione: string;
  istruttore: string;
  maxPartecipanti: number;
  colore?: string;
  note?: string;
  attivo: boolean;
}

export interface Pacchetto {
  id: number;
  nome: string;
  descrizione?: string;
  categoria: string;
  livello?: string;
  durataMinuti?: number;
  maxPartecipanti?: number;
  prezzo: number;
  attivo: boolean;
  venditaId?: number;
  lezioniResidue?: number;
  isCombo?: boolean;
  allowedTypes?: Array<{ templateId?: number; tipoLezione: string; titolo?: string; maxPartecipanti?: number; numeroLezioni?: number }>;
}
