import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Vendita {
  id?: number;
  utenteId: string;
  utente?: {
    id: string;
    username: string;
    nome?: string;
    cognome?: string;
    email?: string;
  };
  pacchettoId: number;
  pacchetto?: {
    id: number;
    nome: string;
    prezzo: number;
  };
  importo: number;
  stato: 'PENDING' | 'PAID' | 'CANCELLED';
  dataAcquisto: string;
  dataPagamento?: string;
  note?: string;
}

// DTO per la creazione di una vendita (corrisponde a VenditaRequest del backend)
export interface VenditaRequest {
  id: number;  // ID dell'utente
  pacchettoId: number;
  importo: number;
  note?: string;
  stato?: 'PENDING' | 'PAID' | 'CANCELLED'; // Stato opzionale (default PAID se non specificato)
}

export interface PacchettoAcquistato {
  venditaId: number;
  pacchettoId: number;
  pacchettoNome: string;
  categoria: string;
  descrizione?: string;
  livello: string;
  durataMinuti: number;
  maxPartecipanti: number;
  prezzo: number;
  dataAcquisto: string;
  dataPagamento?: string;
  stato: string; // "ATTIVO" o "COMPLETATO"
  lezioniTotali: number;
  lezioniPrenotate: number;
  lezioniRimaste: number;
  note?: string;
}

export interface StatisticheVendite {
  totaleVendite: number;
  totaleFatturato: number;
  venditeMese: number;
  fatturateMese: number;
  andamentoMensile: { mese: string; vendite: number; fatturato: number }[];
  distribuzioneProdotti: { nome: string; vendite: number; fatturato: number }[];
  venditePerStato: { stato: string; count: number; percentuale: number }[];
  mediaVenditaGiornaliera: number;
  venditePiuRecenti: Vendita[];
}

@Injectable({
  providedIn: 'root'
})
export class VenditeService {
  private baseUrl = `${environment.apiUrl}/vendite`;

  constructor(private http: HttpClient) { }

  getVendite(): Observable<Vendita[]> {
    return this.http.get<Vendita[]>(this.baseUrl);
  }

  getVenditaById(id: number): Observable<Vendita> {
    return this.http.get<Vendita>(`${this.baseUrl}/${id}`);
  }

  getVenditeByUtente(username: string): Observable<Vendita[]> {
    return this.http.get<Vendita[]>(`${this.baseUrl}/utente/${username}`);
  }

  getVenditePendingByUtente(username: string): Observable<Vendita[]> {
    return this.http.get<Vendita[]>(`${this.baseUrl}/utente/${username}/pending`);
  }

  // Recupera tutte le vendite in stato PENDING
  getVenditePending(): Observable<Vendita[]> {
    return this.http.get<Vendita[]>(`${this.baseUrl}/stato/PENDING`);
  }

  // Conferma il pagamento di una vendita
  confermaPagamento(id: number, importo: number): Observable<Vendita> {
    return this.http.put<Vendita>(`${this.baseUrl}/${id}`, { 
      importo: importo,
      stato: 'PAID'
    });
  }

  getPacchettiAcquistatiByUtente(username: string): Observable<PacchettoAcquistato[]> {
    return this.http.get<PacchettoAcquistato[]>(`${this.baseUrl}/utente/${username}/pacchetti-acquistati`);
  }

  getStatistiche(filtri?: { periodo?: string; dataInizio?: string; dataFine?: string }): Observable<StatisticheVendite> {
    let url = `${this.baseUrl}/statistiche`;
    
    if (filtri) {
      const params = new URLSearchParams();
      if (filtri.periodo) params.append('periodo', filtri.periodo);
      if (filtri.dataInizio) params.append('dataInizio', filtri.dataInizio);
      if (filtri.dataFine) params.append('dataFine', filtri.dataFine);
      
      if (params.toString()) {
        url += '?' + params.toString();
      }
    }
    
    return this.http.get<StatisticheVendite>(url);
  }

  creaVendita(vendita: Omit<Vendita, 'id'>): Observable<Vendita>;
  creaVendita(vendita: VenditaRequest): Observable<Vendita>;
  creaVendita(vendita: Omit<Vendita, 'id'> | VenditaRequest): Observable<Vendita> {
    return this.http.post<Vendita>(this.baseUrl, vendita);
  }

  aggiornaVendita(id: number, vendita: Partial<Vendita>): Observable<Vendita> {
    return this.http.put<Vendita>(`${this.baseUrl}/${id}`, vendita);
  }

  eliminaVendita(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
