export interface PrenotazioneLezioneRequest {
  lezioneId: number;
  note?: string;
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
  postiPrenotati?: number;
}

export interface Pacchetto {
  id: number;
  nome: string;
  descrizione?: string;
  categoria: string;
  categorieLezioni?: string[] | string; // Array JSON per pacchetti COMBO
  distribuzioneLezioni?: { [categoria: string]: number } | string; // Numero lezioni per categoria (COMBO)
  livello?: string;
  durataMinuti?: number;
  maxPartecipanti?: number;
  prezzo: number;
  attivo: boolean;
  numeroLezioni?: number; // Numero totale di lezioni nel pacchetto
  lezioniRimanenti?: number; // Lezioni ancora disponibili
  venditaId?: number; // ID della vendita (quando caricato da pacchetti-utente)
}

// Request per creare prenotazioni ricorrenti
export interface PrenotazioneRicorrenteRequest {
  venditaId: number;
  templateId: number;
  tipoLezione?: string; // Per pacchetti COMBO
  numeroLezioni?: number; // Opzionale, default = tutte disponibili
  dataLezione?: string; // Data di inizio prenotazioni (formato YYYY-MM-DD)
}

// Response dopo creazione prenotazioni ricorrenti
export interface PrenotazioneRicorrenteResponse {
  messaggio: string;
  numeroPrenotazioni: number;
  prenotazioni: PrenotazioneLezione[];
}

// Singola prenotazione di lezione
export interface PrenotazioneLezione {
  id: number;
  venditaId: number;
  utenteId: number;
  templateId: number;
  dataLezione: string; // LocalDate format YYYY-MM-DD
  oraInizio: string; // HH:mm
  oraFine: string; // HH:mm
  tipoLezione: string;
  stato: 'CONFERMATA' | 'CANCELLATA' | 'IN_CODA' | 'SPOSTAMENTO_RICHIESTO';
  numeroSpostamenti: number;
  gruppoId: string;
  note?: string;
  puoEssereSpostata: boolean; // Calcolato dal backend (>24h)
  titolo: string; // Titolo template
  utenteNome: string; // Nome completo utente
  istruttore: string; // Nome istruttore
}

// Richiesta di spostamento
export interface RichiestaSpostamentoRequest {
  prenotazioneId: number;
  tipoRichiesta: 'VA_IN_CODA' | 'CAMBIO_GRUPPO';
  dataRichiesta?: string; // Solo per CAMBIO_GRUPPO
  motivazione: string;
}

// Risposta richiesta spostamento
export interface RichiestaSpostamento {
  id: number;
  prenotazioneId: number;
  utenteId: number;
  tipoRichiesta: 'VA_IN_CODA' | 'CAMBIO_GRUPPO';
  stato: 'PENDING' | 'APPROVED' | 'REJECTED';
  dataOriginale: string;
  dataRichiesta?: string;
  motivazione: string;
  rispostaAdmin?: string;
  dataCreazione: string;
  dataRisposta?: string;
  
  // Dati utente
  nomeUtente?: string;
  cognomeUtente?: string;
  emailUtente?: string;
  
  // Dati prenotazione
  titoloLezione?: string;
  dataLezione?: string;
  oraInizio?: string;
  oraFine?: string;
}
