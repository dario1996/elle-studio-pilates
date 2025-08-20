import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ILezione, TipoLezione } from '../../shared/models/Lezione';

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

@Injectable({
  providedIn: 'root'
})
export class LezioniService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:8080/api/lezioni';

  // Converter helper methods
  private dtoToModel(dto: LezioneDto): ILezione {
    console.log('DTO ricevuto dal backend:', dto);
    const dataInizio = new Date(dto.dataInizio);
    const dataFine = new Date(dto.dataFine);
    console.log('Date convertite - Inizio:', dataInizio, 'Fine:', dataFine);

    // Calcola la durata in minuti
    const durataMinuti = Math.round((dataFine.getTime() - dataInizio.getTime()) / (1000 * 60));

    return {
      id: dto.id,
      titolo: dto.titolo,
      dataInizio,
      dataFine,
      tipo: dto.tipoLezione,
      durata: durataMinuti,
      maxPartecipanti: this.getMaxPartecipantiByTipo(dto.tipoLezione),
      partecipanti: [], // TODO: implementare gestione partecipanti
      partecipantiIscritti: 0, // TODO: implementare gestione partecipanti iscritti dal backend
      istruttore: dto.istruttore,
      istruttoreId: this.getIstruttoreIdByNome(dto.istruttore), // Mappa nome → ID per compatibilità
      descrizione: dto.note || '',
      note: dto.note || '',
      stato: dto.attiva ? 'CONFERMATA' : 'CANCELLATA',
      attiva: dto.attiva || false,
      prezzo: 0, // TODO: implementare gestione prezzi dal backend
      colore: this.getColoreByTipo(dto.tipoLezione)
    } as ILezione;
  }

  private modelToDto(model: ILezione): LezioneDto {
    console.log('Model da convertire:', model);
    const dto = {
      id: model.id,
      titolo: model.titolo,
      dataInizio: this.toLocalISOString(model.dataInizio),
      dataFine: this.toLocalISOString(model.dataFine),
      istruttore: model.istruttore,
      tipoLezione: model.tipo,
      note: model.descrizione || '',
      attiva: model.attiva !== undefined ? model.attiva : (model.stato !== 'CANCELLATA')
    };
    console.log('DTO creato per backend:', dto);
    return dto;
  }

  // Converte una data in ISO string mantenendo l'ora locale (senza conversione UTC)
  private toLocalISOString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    
    const localIso = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    console.log(`Data locale convertita: ${date} -> ${localIso}`);
    return localIso;
  }

  private getMaxPartecipantiByTipo(tipo: TipoLezione): number {
    switch (tipo) {
      case TipoLezione.PRIVATA:
      case TipoLezione.PRIMA_LEZIONE:
        return 1;
      case TipoLezione.SEMI_PRIVATA_DUETTO:
        return 2;
      case TipoLezione.SEMI_PRIVATA_GRUPPO:
        return 4;
      case TipoLezione.MATWORK:
        return 6;
      case TipoLezione.YOGA:
        return 8;
      default:
        return 1;
    }
  }

  private getColoreByTipo(tipo: TipoLezione): string {
    switch (tipo) {
      case TipoLezione.PRIVATA:
        return '#3b82f6';
      case TipoLezione.PRIMA_LEZIONE:
        return '#8b5cf6';
      case TipoLezione.SEMI_PRIVATA_DUETTO:
        return '#10b981';
      case TipoLezione.SEMI_PRIVATA_GRUPPO:
        return '#f59e0b';
      case TipoLezione.MATWORK:
        return '#ef4444';
      case TipoLezione.YOGA:
        return '#84cc16';
      default:
        return '#6b7280';
    }
  }

  private getIstruttoreIdByNome(nome: string): number | undefined {
    // Mapping temporaneo nome → ID (da sostituire con chiamata al backend in futuro)
    const istruttoriMap: Record<string, number> = {
      'Eleonora': 1,
      'Eleonora Bianchi': 1,
      'Marco': 2,
      'Marco Rossi': 2,
      'Sofia': 3,
      'Sofia Verdi': 3
    };
    return istruttoriMap[nome];
  }

  // API methods
  getLezioni(): Observable<ILezione[]> {
    console.log('📤 Service: getLezioni chiamato - richiesta GET al backend');
    return this.http.get<LezioneDto[]>(this.apiUrl)
      .pipe(map(dtos => {
        console.log('📥 Service: ricevute', dtos.length, 'lezioni dal backend');
        const result = dtos.map(dto => this.dtoToModel(dto));
        console.log('✅ Service: lezioni convertite per frontend:', result.length);
        return result;
      }));
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
    console.log('🔧 Service: updateLezione chiamato per ID:', id, 'con dati:', lezione);
    const dto = this.modelToDto(lezione);
    console.log('📤 Service: invio richiesta PUT al backend con DTO:', dto);
    return this.http.put<LezioneDto>(`${this.apiUrl}/${id}`, dto)
      .pipe(map(responseDto => {
        console.log('📥 Service: risposta ricevuta dal backend:', responseDto);
        const result = this.dtoToModel(responseDto);
        console.log('✅ Service: lezione convertita per frontend:', result);
        return result;
      }));
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
