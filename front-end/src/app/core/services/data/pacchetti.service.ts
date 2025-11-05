import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { IPacchetti } from '../../../shared/models/Pacchetti';
import { environment } from '../../../../environments/environment.development';
import { Observable } from 'rxjs';
import { ApiMsg } from '../../../shared/models/ApiMsg';

@Injectable({
  providedIn: 'root',
})
export class PacchettiService {
  server: string = environment.server;
  port: string = environment.port;

  constructor(private httpClient: HttpClient) {}

  getListaPacchetti = () =>
    this.httpClient.get<IPacchetti[]>(
      `http://${this.server}:${this.port}/api/pacchetti/lista`,
    );


  createPacchetto = (pacchetto: IPacchetti) : Observable<ApiMsg> =>
    this.httpClient.post<ApiMsg>(
      `http://${this.server}:${this.port}/api/pacchetti/inserisci`,
      pacchetto
    );

  updatePacchetto = (id: number, pacchetto: IPacchetti) : Observable<ApiMsg> =>
    this.httpClient.put<ApiMsg>(
      `http://${this.server}:${this.port}/api/pacchetti/modifica/${id}`,
      pacchetto
    );

  deletePacchetto = (id: number) : Observable<ApiMsg> =>
    this.httpClient.delete<ApiMsg>(
      `http://${this.server}:${this.port}/api/pacchetti/${id}`
    );


}