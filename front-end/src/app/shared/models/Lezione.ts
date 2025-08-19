export interface ILezione {
  id?: number;
  titolo: string;
  dataInizio: Date;
  dataFine: Date;
  tipo: TipoLezione;
  maxPartecipanti?: number; // solo per tipi di gruppo
  partecipanti: string[]; // usernames degli utenti
  istruttore: string; // username istruttore
  descrizione?: string;
  stato: StatoLezione;
  prezzo?: number;
  location?: string;
  colore?: string; // per differenziare visualmente nel calendar
  // Campi aggiuntivi per compatibilità con il vecchio sistema
  durata?: number;
  partecipantiIscritti?: number;
  istruttoreId?: number;
  note?: string;
  attiva?: boolean;
}

export enum TipoLezione {
  PRIVATA = 'PRIVATA',
  SEMI_PRIVATA_DUETTO = 'SEMI_PRIVATA_DUETTO', // 2 persone
  SEMI_PRIVATA_GRUPPO = 'SEMI_PRIVATA_GRUPPO', // 3-4 persone
  MATWORK = 'MATWORK', // max 6 persone
  YOGA = 'YOGA', // gruppo
  PRIMA_LEZIONE = 'PRIMA_LEZIONE' // 55 minuti analisi posturale
}

export enum StatoLezione {
  PROGRAMMATA = 'PROGRAMMATA',
  CONFERMATA = 'CONFERMATA',
  COMPLETATA = 'COMPLETATA',
  CANCELLATA = 'CANCELLATA',
  IN_ATTESA = 'IN_ATTESA'
}

export interface TipoLezioneConfig {
  label: string;
  durata: number; // in minuti
  maxPartecipanti?: number;
  colore: string;
  descrizione: string;
}

export const TIPI_LEZIONE_CONFIG: Record<TipoLezione, TipoLezioneConfig> = {
  [TipoLezione.PRIVATA]: {
    label: 'Lezione Privata',
    durata: 50,
    maxPartecipanti: 1,
    colore: '#3b82f6',
    descrizione: '50 minuti - programma su misura'
  },
  [TipoLezione.PRIMA_LEZIONE]: {
    label: 'Prima Lezione Privata',
    durata: 55,
    maxPartecipanti: 1,
    colore: '#8b5cf6',
    descrizione: '55 minuti - analisi posturale e anamnesi'
  },
  [TipoLezione.SEMI_PRIVATA_DUETTO]: {
    label: 'Semi Privata Duetto',
    durata: 50,
    maxPartecipanti: 2,
    colore: '#10b981',
    descrizione: '50 minuti - 2 persone'
  },
  [TipoLezione.SEMI_PRIVATA_GRUPPO]: {
    label: 'Semi Privata Gruppo',
    durata: 50,
    maxPartecipanti: 4,
    colore: '#f59e0b',
    descrizione: '50 minuti - 3-4 persone'
  },
  [TipoLezione.MATWORK]: {
    label: 'Matwork',
    durata: 50,
    maxPartecipanti: 6,
    colore: '#ef4444',
    descrizione: '50 minuti - gruppo max 6 partecipanti'
  },
  [TipoLezione.YOGA]: {
    label: 'Yoga',
    durata: 60,
    maxPartecipanti: 8,
    colore: '#84cc16',
    descrizione: '60 minuti - lezione di gruppo'
  }
};
