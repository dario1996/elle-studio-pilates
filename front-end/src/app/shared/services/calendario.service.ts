import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CalendarioTemplate {
  id: number;
  giornoSettimana: string; // e.g. LUNEDI
  oraInizio: string; // HH:mm:ss
  oraFine: string; // HH:mm:ss
  titolo: string;
  tipoLezione: string;
  istruttore?: string;
  maxPartecipanti?: number;
  colore?: string;
  note?: string;
  attivo?: boolean;
}

@Injectable({ providedIn: 'root' })
export class CalendarioService {
  private baseUrl = `${environment.apiUrl}/calendario-settimanale`;

  constructor(private http: HttpClient) {}

  getCalendarioAttivo(): Observable<CalendarioTemplate[]> {
    return this.http.get<CalendarioTemplate[]>(`${this.baseUrl}/attivo`);
  }
}
