import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ICorsi } from '../../../shared/models/Corsi';
import { environment } from '../../../../environments/environment.development';
import { Observable } from 'rxjs';
import { ApiMsg } from '../../../shared/models/ApiMsg';

@Injectable({
  providedIn: 'root',
})
export class CorsiService {
  server: string = environment.server;
  port: string = environment.port;

  constructor(private httpClient: HttpClient) {}

  getListaCorsi = () =>
    this.httpClient.get<ICorsi[]>(
      `http://${this.server}:${this.port}/api/corsi/lista`,
    );


  createCorso = (corso: ICorsi) : Observable<ApiMsg> =>
    this.httpClient.post<ApiMsg>(
      `http://${this.server}:${this.port}/api/corsi/inserisci`,
      corso
    );

  updateCorso = (id: number, corso: ICorsi) : Observable<ApiMsg> =>
    this.httpClient.put<ApiMsg>(
      `http://${this.server}:${this.port}/api/corsi/modifica/${id}`,
      corso
    );

  deleteCorso = (id: number) : Observable<ApiMsg> =>
    this.httpClient.delete<ApiMsg>(
      `http://${this.server}:${this.port}/api/corsi/${id}`
    );


}