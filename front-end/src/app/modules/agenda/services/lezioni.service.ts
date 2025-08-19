import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { ILezione, TipoLezione } from '../models/lezione.model';

@Injectable({
  providedIn: 'root'
})
export class LezioniService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/lezioni';

  // Dati mock per il test
  private mockLezioni: ILezione[] = [
    {
      id: 1,
      titolo: 'Pilates Privato con Eleonora',
      dataInizio: new Date('2025-08-20T09:00:00'),
      dataFine: new Date('2025-08-20T09:50:00'),
      tipo: TipoLezione.PRIVATA,
      durata: 50,
      maxPartecipanti: 1,
      partecipantiIscritti: 1,
      istruttoreId: 1,
      descrizione: 'Lezione privata personalizzata',
      prezzo: 60,
      note: 'Prima lezione del cliente',
      attiva: true
    },
    {
      id: 2,
      titolo: 'Matwork Gruppo',
      dataInizio: new Date('2025-08-20T18:00:00'),
      dataFine: new Date('2025-08-20T18:50:00'),
      tipo: TipoLezione.MATWORK,
      durata: 50,
      maxPartecipanti: 8,
      partecipantiIscritti: 5,
      istruttoreId: 2,
      descrizione: 'Lezione di gruppo sul tappetino',
      prezzo: 25,
      note: '',
      attiva: true
    },
    {
      id: 3,
      titolo: 'Yoga Serale',
      dataInizio: new Date('2025-08-21T19:30:00'),
      dataFine: new Date('2025-08-21T20:30:00'),
      tipo: TipoLezione.YOGA,
      durata: 60,
      maxPartecipanti: 8,
      partecipantiIscritti: 3,
      istruttoreId: 3,
      descrizione: 'Rilassante lezione di yoga',
      prezzo: 20,
      note: 'Portare tappetino',
      attiva: true
    }
  ];

  // GET - Lista tutte le lezioni
  getLezioni(): Observable<ILezione[]> {
    // Per ora restituiamo dati mock, in futuro useremo l'API reale
    return of(this.mockLezioni);
    // return this.http.get<ILezione[]>(this.apiUrl);
  }

  // GET - Lezioni per un periodo specifico
  getLezioniByPeriodo(dataInizio: Date, dataFine: Date): Observable<ILezione[]> {
    // Mock: filtra le lezioni nel periodo richiesto
    const filtered = this.mockLezioni.filter(lezione => {
      const dataLezione = new Date(lezione.dataInizio);
      return dataLezione >= dataInizio && dataLezione <= dataFine;
    });
    return of(filtered);
    
    // Implementazione API reale:
    // const params = {
    //   dataInizio: dataInizio.toISOString().split('T')[0],
    //   dataFine: dataFine.toISOString().split('T')[0]
    // };
    // return this.http.get<ILezione[]>(`${this.apiUrl}/periodo`, { params });
  }

  // GET - Singola lezione
  getLezione(id: number): Observable<ILezione | undefined> {
    const lezione = this.mockLezioni.find(l => l.id === id);
    return of(lezione);
    // return this.http.get<ILezione>(`${this.apiUrl}/${id}`);
  }

  // POST - Crea nuova lezione
  createLezione(lezione: ILezione): Observable<ILezione> {
    const nuovaLezione = {
      ...lezione,
      id: Math.max(...this.mockLezioni.map(l => l.id)) + 1
    };
    this.mockLezioni.push(nuovaLezione);
    return of(nuovaLezione);
    // return this.http.post<ILezione>(this.apiUrl, lezione);
  }

  // PUT - Aggiorna lezione esistente
  updateLezione(id: number, lezione: Partial<ILezione>): Observable<ILezione> {
    const index = this.mockLezioni.findIndex(l => l.id === id);
    if (index !== -1) {
      this.mockLezioni[index] = { ...this.mockLezioni[index], ...lezione };
      return of(this.mockLezioni[index]);
    }
    throw new Error('Lezione non trovata');
    // return this.http.put<ILezione>(`${this.apiUrl}/${id}`, lezione);
  }

  // DELETE - Elimina lezione
  deleteLezione(id: number): Observable<void> {
    const index = this.mockLezioni.findIndex(l => l.id === id);
    if (index !== -1) {
      this.mockLezioni.splice(index, 1);
    }
    return of(void 0);
    // return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  // PUT - Cambia stato attiva/disattiva
  toggleLezioneStatus(id: number): Observable<ILezione> {
    const lezione = this.mockLezioni.find(l => l.id === id);
    if (lezione) {
      lezione.attiva = !lezione.attiva;
      return of(lezione);
    }
    throw new Error('Lezione non trovata');
    // return this.http.put<ILezione>(`${this.apiUrl}/${id}/toggle-status`, {});
  }

  // Metodi per la gestione partecipanti (da implementare)
  aggiungiPartecipante(lezioneId: number, partecipanteId: number): Observable<ILezione> {
    const lezione = this.mockLezioni.find(l => l.id === lezioneId);
    if (lezione && lezione.partecipantiIscritti < lezione.maxPartecipanti) {
      lezione.partecipantiIscritti++;
      return of(lezione);
    }
    throw new Error('Impossibile aggiungere partecipante');
  }

  rimuoviPartecipante(lezioneId: number, partecipanteId: number): Observable<ILezione> {
    const lezione = this.mockLezioni.find(l => l.id === lezioneId);
    if (lezione && lezione.partecipantiIscritti > 0) {
      lezione.partecipantiIscritti--;
      return of(lezione);
    }
    throw new Error('Impossibile rimuovere partecipante');
  }
}
