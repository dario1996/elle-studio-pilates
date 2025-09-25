import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Corso {
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
  corsoId: number;
  data: string;
  orario: string;
  note?: string;
  username: string;
}

@Injectable({
  providedIn: 'root'
})
export class CorsiService {
  private apiUrl = '/api/corsi';

  constructor(private http: HttpClient) {}

  /**
   * Ottiene tutti i corsi attivi
   */
  getCorsiAttivi(): Observable<Corso[]> {
    return this.http.get<Corso[]>(`${this.apiUrl}?attivo=true`);
  }

  /**
   * Ottiene un corso specifico per ID
   */
  getCorsoById(id: number): Observable<Corso> {
    return this.http.get<Corso>(`${this.apiUrl}/${id}`);
  }

  /**
   * Verifica la disponibilità di posti per un corso in una data/orario specifici
   */
  verificaDisponibilita(corsoId: number, data: string, orario: string): Observable<{
    disponibile: boolean;
    postiRimasti: number;
    postiTotali: number;
  }> {
    return this.http.get<{
      disponibile: boolean;
      postiRimasti: number;
      postiTotali: number;
    }>(`${this.apiUrl}/${corsoId}/disponibilita`, {
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
   * Ottiene gli orari disponibili per un corso in una data specifica
   */
  getOrariDisponibili(corsoId: number, data: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/${corsoId}/orari-disponibili`, {
      params: { data }
    });
  }
}