import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

// Backend DTOs
export interface LezioneDto {
  id?: number;
  titolo: string;
  dataInizio: string; // ISO string format
  dataFine: string;   // ISO string format
  istruttore: string;
  tipoLezione: TipoLezione;
  note?: string;
  attiva?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export enum TipoLezione {
  PRIVATA = 'PRIVATA',
  PRIMA_LEZIONE = 'PRIMA_LEZIONE',
  SEMI_PRIVATA = 'SEMI_PRIVATA',
  PILATES_MATWORK = 'PILATES_MATWORK',
  YOGA = 'YOGA'
}

// Frontend model (manteniamo per compatibilità)
export interface ILezione {
  id?: number;
  titolo: string;
  dataInizio: Date;
  dataFine: Date;
  tipo: TipoLezione;
  durata: number;
  maxPartecipanti: number;
  partecipantiIscritti: number;
  istruttoreId: number;
  istruttore?: string;
  descrizione?: string;
  prezzo?: number;
  note?: string;
  attiva: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class LezioniService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/lezioni';

  // Converter helper methods
  private dtoToModel(dto: LezioneDto): ILezione {
    const dataInizio = new Date(dto.dataInizio);
    const dataFine = new Date(dto.dataFine);
    const durata = Math.round((dataFine.getTime() - dataInizio.getTime()) / (1000 * 60)); // minuti

    return {
      id: dto.id,
      titolo: dto.titolo,
      dataInizio,
      dataFine,
      tipo: dto.tipoLezione,
      durata,
      maxPartecipanti: this.getMaxPartecipantiByTipo(dto.tipoLezione),
      partecipantiIscritti: 0, // TODO: implementare gestione partecipanti
      istruttoreId: 0, // TODO: implementare gestione istruttori
      istruttore: dto.istruttore,
      note: dto.note || '',
      attiva: dto.attiva ?? true
    };
  }

  private modelToDto(model: ILezione): LezioneDto {
    return {
      id: model.id,
      titolo: model.titolo,
      dataInizio: model.dataInizio.toISOString(),
      dataFine: model.dataFine.toISOString(),
      istruttore: model.istruttore || '',
      tipoLezione: model.tipo,
      note: model.note || '',
      attiva: model.attiva
    };
  }

  private getMaxPartecipantiByTipo(tipo: TipoLezione): number {
    switch (tipo) {
      case TipoLezione.PRIVATA:
      case TipoLezione.PRIMA_LEZIONE:
        return 1;
      case TipoLezione.SEMI_PRIVATA:
        return 2;
      case TipoLezione.PILATES_MATWORK:
        return 3;
      case TipoLezione.YOGA:
        return 4;
      default:
        return 1;
    }
  }

  // API methods
  getLezioni(): Observable<ILezione[]> {
    return this.http.get<LezioneDto[]>(this.apiUrl)
      .pipe(map(dtos => dtos.map(dto => this.dtoToModel(dto))));
  }

  getLezioniByPeriodo(dataInizio: Date, dataFine: Date): Observable<ILezione[]> {
    const params = new HttpParams()
      .set('dataInizio', dataInizio.toISOString())
      .set('dataFine', dataFine.toISOString());
    
    return this.http.get<LezioneDto[]>(`${this.apiUrl}/range`, { params })
      .pipe(map(dtos => dtos.map(dto => this.dtoToModel(dto))));
  }

  getLezione(id: number): Observable<ILezione> {
    return this.http.get<LezioneDto>(`${this.apiUrl}/${id}`)
      .pipe(map(dto => this.dtoToModel(dto)));
  }

  createLezione(lezione: ILezione): Observable<ILezione> {
    const dto = this.modelToDto(lezione);
    return this.http.post<LezioneDto>(this.apiUrl, dto)
      .pipe(map(responseDto => this.dtoToModel(responseDto)));
  }

  updateLezione(id: number, lezione: ILezione): Observable<ILezione> {
    const dto = this.modelToDto(lezione);
    return this.http.put<LezioneDto>(`${this.apiUrl}/${id}`, dto)
      .pipe(map(responseDto => this.dtoToModel(responseDto)));
  }

  deleteLezione(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  toggleLezioneStatus(id: number): Observable<void> {
    return this.http.patch<void>(`${this.apiUrl}/${id}/toggle-status`, {});
  }

  // Metodi per ricerca
  getLezioniByIstruttore(istruttore: string): Observable<ILezione[]> {
    const params = new HttpParams().set('istruttore', istruttore);
    return this.http.get<LezioneDto[]>(`${this.apiUrl}/istruttore`, { params })
      .pipe(map(dtos => dtos.map(dto => this.dtoToModel(dto))));
  }

  getLezioniByTipo(tipo: TipoLezione): Observable<ILezione[]> {
    const params = new HttpParams().set('tipoLezione', tipo);
    return this.http.get<LezioneDto[]>(`${this.apiUrl}/tipo`, { params })
      .pipe(map(dtos => dtos.map(dto => this.dtoToModel(dto))));
  }
}
