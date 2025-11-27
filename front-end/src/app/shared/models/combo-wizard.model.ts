import { TipoLezione } from './prenotazione.model';

/**
 * Selezione di una categoria per il wizard COMBO
 */
export interface CategoriaSelection {
  categoria: string;
  templateSelezionato: TipoLezione | null;
  numeroLezioni: number;
  numeroLezioniPredefinito: number; // Numero predefinito dal pacchetto (es: 8 reformer, 4 matwork)
  dateGenerate: string[]; // Array di date YYYY-MM-DD
}

/**
 * Stato del wizard COMBO
 */
export interface ComboWizardState {
  venditaId: number;
  pacchetto: {
    nome: string;
    categoria: string;
    lezioniRimanenti: number;
  };
  categorieDisponibili: string[]; // Array delle categorie del pacchetto COMBO
  selezioni: Map<string, CategoriaSelection>; // Key = categoria
  stepCorrente: number; // 0-based: 0 = prima categoria, N = preview finale
  completato: boolean;
}

/**
 * Request per backend: prenotazione COMBO
 */
export interface PrenotazioneComboRequest {
  venditaId: number;
  selezioni: CategoriaSelectionDTO[];
}

/**
 * DTO per singola selezione di categoria (inviato al backend)
 */
export interface CategoriaSelectionDTO {
  categoria: string;
  templateId: number;
  numeroLezioni: number;
}

/**
 * Anteprima aggregata per conferma finale
 */
export interface ComboPreviewItem {
  categoria: string;
  titolo: string;
  giornoSettimana: string;
  oraInizio: string;
  oraFine: string;
  istruttore: string;
  numeroLezioni: number;
  date: string[]; // Array formattato per visualizzazione
}
