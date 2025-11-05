import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  PrenotazioneLezioneRequest, 
  PrenotazioneLezioneResponse, 
  LezioneDisponibile,
  TipoLezione,
  Pacchetto 
} from '../models/prenotazione.model';

@Injectable({
  providedIn: 'root'
})
export class PrenotazioneService {
  private baseUrl = `${environment.apiUrl}/prenotazioni`;

  constructor(private http: HttpClient) { }

  /**
   * Recupera tutti i tipi di lezione disponibili dal calendario settimanale
   */
  getTipiLezioneDisponibili(): Observable<TipoLezione[]> {
    return this.http.get<TipoLezione[]>(`${this.baseUrl}/tipi-lezione`);
  }

  /**
   * Recupera i pacchetti acquistati e pagati dall'utente corrente
   */
  getPacchettiUtente(): Observable<Pacchetto[]> {
    return this.http.get<Pacchetto[]>(`${this.baseUrl}/pacchetti-utente`);
  }

  /**
   * Recupera i tipi di lezione filtrati per categoria del pacchetto
   */
  getTipiLezionePerPacchetto(pacchettoId: number): Observable<TipoLezione[]> {
    return this.http.get<TipoLezione[]>(`${this.baseUrl}/tipi-lezione/pacchetto/${pacchettoId}`);
  }

  /**
   * Recupera le lezioni per un tipo specifico in un range di date
   */
  getLezioniPerTemplate(templateId: number, dataInizio: string, dataFine: string): Observable<LezioneDisponibile[]> {
    const params = new HttpParams()
      .set('dataInizio', dataInizio)
      .set('dataFine', dataFine);
    
    return this.http.get<LezioneDisponibile[]>(`${this.baseUrl}/lezioni-per-template/${templateId}`, { params });
  }

  /**
   * Recupera le lezioni disponibili per un range di date
   */
  getLezioniDisponibili(dataInizio: string, dataFine: string): Observable<LezioneDisponibile[]> {
    const params = new HttpParams()
      .set('dataInizio', dataInizio)
      .set('dataFine', dataFine);
    
    return this.http.get<LezioneDisponibile[]>(`${this.baseUrl}/lezioni-disponibili`, { params });
  }

  /**
   * Recupera le lezioni disponibili per una specifica data
   */
  getLezioniDisponibiliPerData(data: string): Observable<LezioneDisponibile[]> {
    return this.http.get<LezioneDisponibile[]>(`${this.baseUrl}/lezioni-disponibili/${data}`);
  }

  /**
   * Verifica la disponibilità di una specifica lezione
   */
  verificaDisponibilitaLezione(lezioneId: number): Observable<LezioneDisponibile> {
    return this.http.get<LezioneDisponibile>(`${this.baseUrl}/lezione/${lezioneId}/disponibilita`);
  }

  /**
   * Crea una nuova prenotazione
   */
  creaPrenotazione(request: PrenotazioneLezioneRequest): Observable<void> {
    return this.http.post<void>(this.baseUrl, request);
  }

  /**
   * Recupera tutte le prenotazioni dell'utente corrente
   */
  getMiePrenotazioni(): Observable<PrenotazioneLezioneResponse[]> {
    return this.http.get<PrenotazioneLezioneResponse[]>(`${this.baseUrl}/mie`);
  }

  /**
   * Recupera le prenotazioni future dell'utente corrente
   */
  getMiePrenotazioniFuture(): Observable<PrenotazioneLezioneResponse[]> {
    return this.http.get<PrenotazioneLezioneResponse[]>(`${this.baseUrl}/mie?future=true`);
  }

  /**
   * Cancella una prenotazione
   */
  cancellaPrenotazione(lezioneId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${lezioneId}`);
  }
}
