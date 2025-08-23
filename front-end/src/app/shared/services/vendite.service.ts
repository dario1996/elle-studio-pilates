import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Vendita {
  id?: number;
  utenteId: string;
  corsoId: number;
  importo: number;
  stato: 'PENDING' | 'PAID' | 'CANCELLED';
  dataAcquisto: string;
  dataPagamento?: string;
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

  creaVendita(vendita: Omit<Vendita, 'id'>): Observable<Vendita> {
    return this.http.post<Vendita>(this.baseUrl, vendita);
  }

  aggiornaVendita(id: number, vendita: Partial<Vendita>): Observable<Vendita> {
    return this.http.put<Vendita>(`${this.baseUrl}/${id}`, vendita);
  }

  eliminaVendita(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
