import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  PrenotazioneLezioneRequest, 
  PrenotazioneLezioneResponse, 
  LezioneDisponibile,
  TipoLezione,
  Pacchetto,
  PrenotazioneRicorrenteRequest,
  PrenotazioneRicorrenteResponse,
  PrenotazioneLezione,
  RichiestaSpostamentoRequest,
  RichiestaSpostamento
} from '../models/prenotazione.model';
import { PrenotazioneComboRequest } from '../models/combo-wizard.model';

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
   * Recupera i template del calendario settimanale per un tipo di lezione specifico
   */
  getTemplatesPerTipoLezione(tipoLezione: string): Observable<TipoLezione[]> {
    return this.http.get<TipoLezione[]>(`${environment.apiUrl}/calendario-settimanale/per-tipo-lezione/${tipoLezione}`);
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
  creaPrenotazione(request: PrenotazioneLezioneRequest): Observable<PrenotazioneLezioneResponse> {
    return this.http.post<PrenotazioneLezioneResponse>(this.baseUrl, request);
  }

  /**
   * Recupera tutte le prenotazioni dell'utente corrente
   */
  getMiePrenotazioni(): Observable<PrenotazioneLezioneResponse[]> {
    return this.http.get<PrenotazioneLezioneResponse[]>(`${this.baseUrl}/mie-prenotazioni`);
  }

  /**
   * Recupera le prenotazioni future dell'utente corrente
   */
  getMiePrenotazioniFuture(): Observable<PrenotazioneLezioneResponse[]> {
    return this.http.get<PrenotazioneLezioneResponse[]>(`${this.baseUrl}/mie-prenotazioni/future`);
  }

  /**
   * Cancella una prenotazione
   */
  cancellaPrenotazione(prenotazioneId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${prenotazioneId}`);
  }

  // ============================================
  // NUOVI METODI PER PRENOTAZIONI RICORRENTI
  // ============================================

  /**
   * Crea prenotazioni ricorrenti (N lezioni settimanali)
   */
  prenotaRicorrente(request: PrenotazioneRicorrenteRequest): Observable<PrenotazioneRicorrenteResponse> {
    return this.http.post<PrenotazioneRicorrenteResponse>(`${this.baseUrl}/prenota-ricorrente`, request);
  }

  /**
   * Recupera le prenotazioni future dell'utente (nuovo formato)
   */
  getMiePrenotazioniRicorrenti(): Observable<PrenotazioneLezione[]> {
    return this.http.get<PrenotazioneLezione[]>(`${this.baseUrl}/mie-prenotazioni`);
  }

  /**
   * Recupera TUTTE le prenotazioni future (per admin)
   */
  getTuttePrenotazioni(): Observable<PrenotazioneLezione[]> {
    return this.http.get<PrenotazioneLezione[]>(`${this.baseUrl}/tutte-prenotazioni`);
  }

  /**
   * Cancella una singola prenotazione ricorrente
   */
  cancellaPrenotazioneRicorrente(prenotazioneId: number): Observable<{messaggio: string}> {
    return this.http.delete<{messaggio: string}>(`${this.baseUrl}/cancella/${prenotazioneId}`);
  }

  /**
   * Crea una richiesta di spostamento prenotazione
   */
  creaRichiestaSpostamento(request: RichiestaSpostamentoRequest): Observable<RichiestaSpostamento> {
    return this.http.post<RichiestaSpostamento>(`${this.baseUrl}/richiesta-spostamento`, request);
  }

  /**
   * Recupera le richieste di spostamento dell'utente
   */
  getMieRichiesteSpostamento(): Observable<RichiestaSpostamento[]> {
    return this.http.get<RichiestaSpostamento[]>(`${this.baseUrl}/mie-richieste-spostamento`);
  }

  /**
   * Crea prenotazioni COMBO (multiple categorie)
   */
  prenotaCombo(request: PrenotazioneComboRequest): Observable<PrenotazioneRicorrenteResponse> {
    return this.http.post<PrenotazioneRicorrenteResponse>(`${this.baseUrl}/prenota-ricorrente-combo`, request);
  }
}
