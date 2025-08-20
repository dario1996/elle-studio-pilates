import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LezioneDto } from '../../core/services/lezioni.service';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  /**
   * Ottiene gli appuntamenti di oggi dall'ora corrente in poi
   */
  getAppuntamentiOggi(): Observable<LezioneDto[]> {
    return this.http.get<LezioneDto[]>(`${this.apiUrl}/dashboard/appuntamenti-oggi`);
  }
}
