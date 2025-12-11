import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';
import { LezioneDto } from '../../core/services/lezioni.service';

export interface ProssimaLezioneDto {
  dataLezione: string;
  oraInizio: string;
  oraFine: string;
  tipoLezione: string;
  stato: string;
}

export interface DashboardStatisticheDto {
  prossimaLezione: ProssimaLezioneDto | null;
  totaleLezioniPrenotate: number;
  lezioniCompletate: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /**
   * Ottiene gli appuntamenti di oggi dall'ora corrente in poi
   */
  getAppuntamentiOggi(): Observable<LezioneDto[]> {
    return this.http.get<LezioneDto[]>(`${this.apiUrl}/dashboard/appuntamenti-oggi`);
  }

  /**
   * Ottiene le statistiche della dashboard utente
   */
  getStatisticheUtente(): Observable<DashboardStatisticheDto> {
    return this.http.get<DashboardStatisticheDto>(`${this.apiUrl}/dashboard/statistiche-utente`);
  }
}
