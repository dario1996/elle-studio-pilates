import { Injectable, inject } from '@angular/core';

import { ApiMsg } from '../../../shared/models/ApiMsg';
import { HttpClient } from '@angular/common/http';
import { IUsers } from '../../../shared/models/Users';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  server: string = environment.server;
  port: string = environment.port;

  httpClient = inject(HttpClient);

  // CRUD Operations
  getListaUtenti = (soloAttivi: boolean = false) =>
    this.httpClient.get<IUsers[]>(
      `http://${this.server}:${this.port}/api/utenti`,
      {
        params: {
          soloAttivi: soloAttivi.toString(),
        },
      },
    );

  getUtenteById = (id: string) =>
    this.httpClient.get<IUsers>(
      `http://${this.server}:${this.port}/api/utenti/${id}`,
    );

  getUtenteByUsername = (username: string) =>
    this.httpClient.get<IUsers>(
      `http://${this.server}:${this.port}/api/utenti/username/${username}`,
    );

  insUtente = (utente: IUsers) =>
    this.httpClient.post<IUsers>(
      `http://${this.server}:${this.port}/api/utenti`,
      utente,
    );

  updUtente = (username: string, utente: IUsers) =>
    this.httpClient.put<IUsers>(
      `http://${this.server}:${this.port}/api/utenti/${username}`,
      utente,
    );

  delUtente = (username: string) =>
    this.httpClient.delete<void>(
      `http://${this.server}:${this.port}/api/utenti/${username}`,
    );

  toggleUtenteStatus = (username: string) =>
    this.httpClient.patch<IUsers>(
      `http://${this.server}:${this.port}/api/utenti/${username}/toggle-status`,
      {},
    );

  permanentDeleteUtente = (username: string) =>
    this.httpClient.delete<void>(
      `http://${this.server}:${this.port}/api/utenti/${username}/permanent`,
    );

  searchUtenti = (
    search?: string,
    ruolo?: string,
    soloAttivi: boolean = true,
  ) =>
    this.httpClient.get<IUsers[]>(
      `http://${this.server}:${this.port}/api/utenti`,
      {
        params: {
          ...(search && { search }),
          ...(ruolo && { ruolo }),
          soloAttivi: soloAttivi.toString(),
        },
      },
    );

  // Download certificato medico
  downloadCertificatoMedico = (username: string) =>
    this.httpClient.get(
      `http://${this.server}:${this.port}/api/upload/certificato-medico/${username}`,
      { responseType: 'blob' }
    );

  /* 
  // IMPORT MASSIVO - COMMENTATO PER ORA
  bulkImport = (utenti: any[], options?: any) =>
    this.httpClient.post<any>(
      `http://${this.server}:${this.port}/api/utenti/bulk-import`,
      {
        utenti: utenti,
        options: {
          skipErrors: options?.skipErrors ?? true,
          updateExisting: options?.updateExisting ?? false,
          defaultRuolo: options?.defaultRuolo ?? 'utente'
        }
      },
    );

  checkDuplicates = (utenti: any[]) =>
    this.httpClient.post<any>(
      `http://${this.server}:${this.port}/api/utenti/check-duplicates`,
      { utenti: utenti },
    );
  */

  // Legacy method for backward compatibility
  insUser = (user: IUsers) =>
    this.httpClient.post<ApiMsg>(
      `http://${this.server}:${this.port}/api/utenti/register`,
      user,
    );
}
