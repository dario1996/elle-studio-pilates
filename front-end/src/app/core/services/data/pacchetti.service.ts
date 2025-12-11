import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IPacchetti } from '../../../shared/models/Pacchetti';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { ApiMsg } from '../../../shared/models/ApiMsg';

@Injectable({
  providedIn: 'root',
})
export class PacchettiService {
  private apiUrl = environment.apiUrl;

  constructor(private httpClient: HttpClient) {}

  getListaPacchetti = () =>
    this.httpClient.get<IPacchetti[]>(
      `${this.apiUrl}/api/pacchetti/lista`,
    );


  createPacchetto = (pacchetto: IPacchetti) : Observable<ApiMsg> =>
    this.httpClient.post<ApiMsg>(
      `${this.apiUrl}/api/pacchetti/inserisci`,
      pacchetto
    );

  updatePacchetto = (id: number, pacchetto: IPacchetti) : Observable<ApiMsg> =>
    this.httpClient.put<ApiMsg>(
      `${this.apiUrl}/api/pacchetti/modifica/${id}`,
      pacchetto
    );

  deletePacchetto = (id: number) : Observable<ApiMsg> =>
    this.httpClient.delete<ApiMsg>(
      `${this.apiUrl}/api/pacchetti/${id}`
    );


}
