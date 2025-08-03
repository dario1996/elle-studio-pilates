import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
// import { ApiMsg } from '../../../shared/models/ApiMsg';
import { IPiattaforma } from '../../../shared/models/Piattaforma';
import { ApiMsg } from '../../../shared/models/ApiMsg';

@Injectable({
  providedIn: 'root',
})
export class PiattaformeService {
  server: string = environment.server;
  port: string = environment.port;

  constructor(private httpClient: HttpClient) {}

  getListaPiattaforme = () =>
    this.httpClient.get<IPiattaforma[]>(
      `http://${this.server}:${this.port}/api/piattaforme/lista`,
    );

  addPiattaforma = (piattaforma: IPiattaforma) =>
    this.httpClient.post<ApiMsg>(
      `http://${this.server}:${this.port}/api/piattaforme/inserisci`,
      piattaforma,
    );

  editPiattaforma = (id: number, piattaforma: IPiattaforma) =>
    this.httpClient.put<ApiMsg>(
      `http://${this.server}:${this.port}/api/piattaforme/modifica/${id}`,
      piattaforma,
    );

  deletePiattaforma = (id: number) =>
    this.httpClient.delete<ApiMsg>(
      `http://${this.server}:${this.port}/api/piattaforme/elimina/${id}`,
    );
}
