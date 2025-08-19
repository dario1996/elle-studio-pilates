import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ILezione } from '../../../shared/models/Lezione';

@Injectable({
  providedIn: 'root'
})
export class LezioniService {
  private apiUrl = 'http://localhost:8080/api/lezioni';

  constructor(private http: HttpClient) {}

  // GET - Lista tutte le lezioni
  getLezioni(): Observable<ILezione[]> {
    return this.http.get<ILezione[]>(this.apiUrl);
  }

  // GET - Lezioni per un periodo specifico
  getLezioniByPeriodo(dataInizio: Date, dataFine: Date): Observable<ILezione[]> {
    const params = {
      dataInizio: dataInizio.toISOString().split('T')[0],
      dataFine: dataFine.toISOString().split('T')[0]
    };
    return this.http.get<ILezione[]>(`${this.apiUrl}/periodo`, { params });
  }

  // GET - Singola lezione
  getLezione(id: number): Observable<ILezione> {
    return this.http.get<ILezione>(`${this.apiUrl}/${id}`);
  }

  // POST - Crea nuova lezione
  creaLezione(lezione: ILezione): Observable<ILezione> {
    return this.http.post<ILezione>(this.apiUrl, lezione);
  }

  // PUT - Aggiorna lezione esistente
  aggiornaLezione(id: number, lezione: ILezione): Observable<ILezione> {
    return this.http.put<ILezione>(`${this.apiUrl}/${id}`, lezione);
  }

  // DELETE - Elimina lezione
  eliminaLezione(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // PUT - Cancella lezione (cambia stato)
  cancellaLezione(id: number): Observable<ILezione> {
    return this.http.put<ILezione>(`${this.apiUrl}/${id}/cancella`, {});
  }

  // PUT - Aggiungi partecipante
  aggiungiPartecipante(lezioneId: number, username: string): Observable<ILezione> {
    return this.http.put<ILezione>(`${this.apiUrl}/${lezioneId}/partecipanti/${username}`, {});
  }

  // DELETE - Rimuovi partecipante
  rimuoviPartecipante(lezioneId: number, username: string): Observable<ILezione> {
    return this.http.delete<ILezione>(`${this.apiUrl}/${lezioneId}/partecipanti/${username}`);
  }

  // GET - Lezioni per istruttore
  getLezioniIstruttore(usernameIstruttore: string): Observable<ILezione[]> {
    return this.http.get<ILezione[]>(`${this.apiUrl}/istruttore/${usernameIstruttore}`);
  }

  // GET - Disponibilità slot per una data
  checkDisponibilita(data: Date, tipo: string): Observable<boolean> {
    const params = {
      data: data.toISOString(),
      tipo: tipo
    };
    return this.http.get<boolean>(`${this.apiUrl}/disponibilita`, { params });
  }
}
