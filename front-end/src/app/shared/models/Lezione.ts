export interface ILezione {
  id?: number;
  titolo: string;
  dataInizio: Date;
  dataFine: Date;
  tipo: TipoLezione;
  tipoLabel?: string; // Label leggibile del tipo lezione
  maxPartecipanti?: number; // solo per tipi di gruppo
  partecipanti: string[]; // usernames degli utenti
  istruttore: string; // username istruttore
  stato: StatoLezione;
  prezzo?: number;
  location?: string;
  colore?: string; // per differenziare visualmente nel calendar
  durata?: number;
  partecipantiIscritti?: number;
  istruttoreId?: number;
  note?: string;
  attiva?: boolean;
}

export enum TipoLezione {
  PRIVATA = 'PRIVATA',
  SEMI_PRIVATA = 'SEMI_PRIVATA',
  PILATES_MATWORK = 'PILATES_MATWORK',
  YOGA = 'YOGA',
  PRIMA_LEZIONE = 'PRIMA_LEZIONE',
  STUDIO_INTERMEDIO = 'STUDIO_INTERMEDIO',
  REFORMER_INTERMEDIO = 'REFORMER_INTERMEDIO',
  STUDIO_POSTURALE = 'STUDIO_POSTURALE'
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
    colore: '#ec4899',
    descrizione: '50 minuti - programma su misura'
  },
  [TipoLezione.PRIMA_LEZIONE]: {
    label: 'Prima Lezione Privata',
    durata: 55,
    maxPartecipanti: 1,
    colore: '#8b5cf6',
    descrizione: '55 minuti - analisi posturale e anamnesi'
  },
  [TipoLezione.SEMI_PRIVATA]: {
    label: 'Semi Privata',
    durata: 50,
    maxPartecipanti: 4,
    colore: '#14b8a6',
    descrizione: '50 minuti - 3-4 persone'
  },
  [TipoLezione.PILATES_MATWORK]: {
    label: 'Pilates Matwork',
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
  },
  [TipoLezione.STUDIO_INTERMEDIO]: {
    label: 'Studio Intermedio',
    durata: 50,
    maxPartecipanti: 4,
    colore: '#f59e0b',
    descrizione: '50 minuti - livello intermedio'
  },
  [TipoLezione.REFORMER_INTERMEDIO]: {
    label: 'Reformer Intermedio',
    durata: 50,
    maxPartecipanti: 4,
    colore: '#3b82f6',
    descrizione: '50 minuti - reformer livello intermedio'
  },
  [TipoLezione.STUDIO_POSTURALE]: {
    label: 'Studio Posturale',
    durata: 50,
    maxPartecipanti: 1,
    colore: '#a855f7',
    descrizione: '50 minuti - analisi e correzione posturale'
  }
};
