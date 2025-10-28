import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Pacchetto {
  id: number;
  nome: string;
  descrizione?: string;
  categoria: string;
  livello: string;
  durataMinuti: number;
  maxPartecipanti: number;
  prezzo: number;
  attivo: boolean;
  dataCreazione?: string;
  dataModifica?: string;
}

export interface PrenotazioneRequest {
  pacchettoId: number;
  data: string;
  orario: string;
  note?: string;
  username: string;
}

@Injectable({
  providedIn: 'root'
})
export class PacchettiService {
  private apiUrl = '/api/pacchetti';

  constructor(private http: HttpClient) {}

  /**
   * Ottiene tutti i pacchetti attivi
   */
  getPacchettiAttivi(): Observable<Pacchetto[]> {
    return this.http.get<Pacchetto[]>(`${this.apiUrl}?attivo=true`);
  }

  /**
   * Ottiene un pacchetto specifico per ID
   */
  getPacchettoById(id: number): Observable<Pacchetto> {
    return this.http.get<Pacchetto>(`${this.apiUrl}/${id}`);
  }

  /**
   * Verifica la disponibilità di posti per un pacchetto in una data/orario specifici
   */
  verificaDisponibilita(pacchettoId: number, data: string, orario: string): Observable<{
    disponibile: boolean;
    postiRimasti: number;
    postiTotali: number;
  }> {
    return this.http.get<{
      disponibile: boolean;
      postiRimasti: number;
      postiTotali: number;
    }>(`${this.apiUrl}/${pacchettoId}/disponibilita`, {
      params: { data, orario }
    });
  }

  /**
   * Effettua una prenotazione
   */
  effettuaPrenotazione(prenotazione: PrenotazioneRequest): Observable<any> {
    return this.http.post(`/api/prenotazioni`, prenotazione);
  }

  /**
   * Ottiene gli orari disponibili per un pacchetto in una data specifica
   */
  getOrariDisponibili(pacchettoId: number, data: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/${pacchettoId}/orari-disponibili`, {
      params: { data }
    });
  }
}