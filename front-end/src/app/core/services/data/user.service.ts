import { Injectable, inject } from '@angular/core';

import { ApiMsg } from '../../../shared/models/ApiMsg';
import { HttpClient } from '@angular/common/http';
import { IUsers } from '../../../shared/models/Users';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = environment.apiUrl;

  httpClient = inject(HttpClient);

  // CRUD Operations
  getListaUtenti = (soloAttivi: boolean = false) =>
    this.httpClient.get<IUsers[]>(
      `${this.apiUrl}/utenti`,
      {
        params: {
          soloAttivi: soloAttivi.toString(),
        },
      },
    );

  getUtenteById = (id: string) =>
    this.httpClient.get<IUsers>(
      `${this.apiUrl}/utenti/${id}`,
    );

  getUtenteByUsername = (username: string) =>
    this.httpClient.get<IUsers>(
      `${this.apiUrl}/utenti/username/${username}`,
    );

  insUtente = (utente: IUsers) =>
    this.httpClient.post<IUsers>(
      `${this.apiUrl}/utenti`,
      utente,
    );

  updUtente = (id: number, utente: IUsers) => {
    return this.httpClient.put<IUsers>(
      `${this.apiUrl}/utenti/${id}`,
      utente,
    );
  }

  delUtente = (id: number) =>
    this.httpClient.delete<void>(
      `${this.apiUrl}/utenti/${id}`,
    );

  toggleUtenteStatus = (id: number) =>
    this.httpClient.put<IUsers>(
      `${this.apiUrl}/utenti/${id}/toggle-status`,
      {},
    );

  searchUtenti = (
    search?: string,
    ruolo?: string,
    soloAttivi: boolean = true,
  ) =>
    this.httpClient.get<IUsers[]>(
      `${this.apiUrl}/utenti`,
      {
        params: {
          ...(search && { search }),
          ...(ruolo && { ruolo }),
          soloAttivi: soloAttivi.toString(),
        },
      },
    );

  // Autocomplete utenti per form lezioni
  getUtentiAutocomplete = (search?: string) =>
    this.httpClient.get<any[]>(
      `${this.apiUrl}/utenti/autocomplete`,
      {
        params: {
          ...(search && { search }),
        },
      },
    );

  // Ottieni dati utenti per username multipli
  getUtentiByUsernames = (usernames: string[]) =>
    this.httpClient.post<IUsers[]>(
      `${this.apiUrl}/utenti/by-usernames`,
      { usernames }
    );

  // Download certificato medico
  downloadCertificatoMedico = (username: string) =>
    this.httpClient.get(
      `${this.apiUrl}/upload/certificato-medico/${username}`,
      { responseType: 'blob' }
    );

  // Cambio password
  changePassword = (username: string, oldPassword: string, newPassword: string) =>
    this.httpClient.put<ApiMsg>(
      `${this.apiUrl}/utenti/${username}/change-password`,
      {
        oldPassword: oldPassword,
        newPassword: newPassword
      }
    );

  /* 
  // IMPORT MASSIVO - COMMENTATO PER ORA
  bulkImport = (utenti: any[], options?: any) =>
    this.httpClient.post<any>(
      `${this.apiUrl}/utenti/bulk-import`,
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
      `${this.apiUrl}/utenti/check-duplicates`,
      { utenti: utenti },
    );
  */

  // Legacy method for backward compatibility
  insUser = (user: IUsers) =>
    this.httpClient.post<ApiMsg>(
      `${this.apiUrl}/utenti/register`,
      user,
    );
}
