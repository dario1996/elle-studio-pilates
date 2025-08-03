import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment.development';
import {
  IDipendenti,
  DipendenteCreateRequest,
} from '../../../shared/models/Dipendenti';
import { ApiMsg } from '../../../shared/models/ApiMsg';

@Injectable({
  providedIn: 'root',
})
export class DipendentiService {
  server: string = environment.server;
  port: string = environment.port;

  constructor(private httpClient: HttpClient) {}

  getListaDipendenti = (soloAttivi: boolean = false) =>
    this.httpClient.get<IDipendenti[]>(
      `http://${this.server}:${this.port}/api/dipendenti`,
      {
        params: {
          soloAttivi: soloAttivi.toString(),
        },
      },
    );

  getDipendenteById = (id: number) =>
    this.httpClient.get<IDipendenti>(
      `http://${this.server}:${this.port}/api/dipendenti/${id}`,
    );

  getDipendenteByCodice = (codiceDipendente: string) =>
    this.httpClient.get<IDipendenti>(
      `http://${this.server}:${this.port}/api/dipendenti/codice/${codiceDipendente}`,
    );

  insDipendente = (dipendente: DipendenteCreateRequest) =>
    this.httpClient.post<IDipendenti>(
      `http://${this.server}:${this.port}/api/dipendenti`,
      dipendente,
    );

  updDipendente = (id: number, dipendente: DipendenteCreateRequest) =>
    this.httpClient.put<IDipendenti>(
      `http://${this.server}:${this.port}/api/dipendenti/${id}`,
      dipendente,
    );

  delDipendente = (id: number) =>
    this.httpClient.delete<void>(
      `http://${this.server}:${this.port}/api/dipendenti/${id}`,
    );

  toggleDipendenteStatus = (id: number) =>
    this.httpClient.patch<IDipendenti>(
      `http://${this.server}:${this.port}/api/dipendenti/${id}/toggle-status`,
      {},
    );

  permanentDeleteDipendente = (id: number) =>
    this.httpClient.delete<void>(
      `http://${this.server}:${this.port}/api/dipendenti/${id}/permanent`,
    );

  searchDipendenti = (
    search?: string,
    reparto?: string,
    commerciale?: string,
    soloAttivi: boolean = true,
  ) =>
    this.httpClient.get<IDipendenti[]>(
      `http://${this.server}:${this.port}/api/dipendenti`,
      {
        params: {
          ...(search && { search }),
          ...(reparto && { reparto }),
          ...(commerciale && { commerciale }),
          soloAttivi: soloAttivi.toString(),
        },
      },
    );

  bulkImport = (dipendenti: any[], options?: any) =>
    this.httpClient.post<any>(
      `http://${this.server}:${this.port}/api/dipendenti/bulk-import`,
      {
        dipendenti: dipendenti,
        options: {
          skipErrors: options?.skipErrors ?? true,
          updateExisting: options?.updateExisting ?? false,
          defaultReparto: options?.defaultReparto ?? 'IT',
          defaultCommerciale: options?.defaultCommerciale ?? 'Generale'
        }
      },
    );

  checkDuplicates = (dipendenti: any[]) =>
    this.httpClient.post<any>(
      `http://${this.server}:${this.port}/api/dipendenti/check-duplicates`,
      { dipendenti: dipendenti },
    );
}
