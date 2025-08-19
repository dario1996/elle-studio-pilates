export interface ILezione {
  id?: number;
  titolo: string;
  dataInizio: Date;
  dataFine: Date;
  tipo: TipoLezione;
  durata: number;
  maxPartecipanti: number;
  partecipantiIscritti: number;
  istruttoreId: number;
  istruttore?: string; // Aggiunto per compatibilità con backend
  descrizione?: string;
  prezzo?: number; // Opzionale
  note?: string;
  attiva: boolean;
}

export enum TipoLezione {
  PRIVATA = 'PRIVATA',
  PRIMA_LEZIONE = 'PRIMA_LEZIONE',
  SEMI_PRIVATA_DUETTO = 'SEMI_PRIVATA_DUETTO',
  SEMI_PRIVATA_GRUPPO = 'SEMI_PRIVATA_GRUPPO',
  MATWORK = 'MATWORK',
  YOGA = 'YOGA'
}

export interface TipoLezioneConfig {
  label: string;
  durata: number;
  maxPartecipanti: number;
  colore: string;
  descrizione: string;
}

export const TIPI_LEZIONE_CONFIG: Record<TipoLezione, TipoLezioneConfig> = {
  [TipoLezione.PRIVATA]: {
    label: 'Lezione Privata',
    durata: 50,
    maxPartecipanti: 1,
    colore: '#3b82f6',
    descrizione: '50 minuti - programma personalizzato'
  },
  [TipoLezione.PRIMA_LEZIONE]: {
    label: 'Prima Lezione',
    durata: 60,
    maxPartecipanti: 1,
    colore: '#8b5cf6',
    descrizione: '60 minuti - analisi posturale e anamnesi'
  },
  [TipoLezione.SEMI_PRIVATA_DUETTO]: {
    label: 'Semi-Privata Duetto',
    durata: 50,
    maxPartecipanti: 2,
    colore: '#10b981',
    descrizione: '50 minuti - 2 persone'
  },
  [TipoLezione.SEMI_PRIVATA_GRUPPO]: {
    label: 'Semi-Privata Gruppo',
    durata: 50,
    maxPartecipanti: 4,
    colore: '#f59e0b',
    descrizione: '50 minuti - 3-4 persone'
  },
  [TipoLezione.MATWORK]: {
    label: 'Matwork',
    durata: 50,
    maxPartecipanti: 8,
    colore: '#ef4444',
    descrizione: '50 minuti - gruppo max 8 partecipanti'
  },
  [TipoLezione.YOGA]: {
    label: 'Yoga',
    durata: 60,
    maxPartecipanti: 8,
    colore: '#84cc16',
    descrizione: '60 minuti - lezione di gruppo'
  }
};
