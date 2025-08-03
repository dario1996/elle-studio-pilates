import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, catchError, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import {
  IAssegnazione,
  AssegnazioneCreateRequest,
  AssegnazioneUpdateRequest,
  AssegnazioneStato,
} from '../../../shared/models/Assegnazione';

@Injectable({
  providedIn: 'root',
})
export class AssegnazioniService {
  server: string = environment.server;
  port: string = environment.port;

  constructor(private httpClient: HttpClient) {}

  // Assegna un corso a un dipendente
  assignCorsoToDipendente = (
    dipendenteId: number,
    corsoId: number,
    obbligatorio: boolean = false,
  ) =>
    this.httpClient.post<IAssegnazione>(
      `http://${this.server}:${this.port}/api/dipendenti/${dipendenteId}/corsi/${corsoId}`,
      {},
      { params: { obbligatorio: obbligatorio.toString() } },
    );

  // Recupera tutte le assegnazioni di un dipendente
  getAssegnazionesByDipendente = (dipendenteId: number) =>
    this.httpClient.get<IAssegnazione[]>(
      `http://${this.server}:${this.port}/api/dipendenti/${dipendenteId}/assegnazioni`,
    );

  // Recupera tutte le assegnazioni di un corso
  getAssegnazioniByCorso = (corsoId: number) =>
    this.httpClient.get<IAssegnazione[]>(
      `http://${this.server}:${this.port}/api/corsi/${corsoId}/assegnazioni`,
    );

  // Recupera una specifica assegnazione
  getAssegnazioneById = (assegnazioneId: number) =>
    this.httpClient.get<IAssegnazione>(
      `http://${this.server}:${this.port}/api/assegnazioni/${assegnazioneId}`,
    );

  // Aggiorna lo stato di un'assegnazione
  updateAssegnazioneStato = (
    assegnazioneId: number,
    stato: AssegnazioneStato,
  ) =>
    this.httpClient.put<IAssegnazione>(
      `http://${this.server}:${this.port}/api/assegnazioni/${assegnazioneId}/stato`,
      null,
      { params: { stato: stato } },
    );

  // Aggiorna un'assegnazione completa
  updateAssegnazione = (
    assegnazioneId: number,
    updateData: AssegnazioneUpdateRequest,
  ) => {
    const params: any = {};

    if (updateData.stato !== undefined) params.stato = updateData.stato;
    if (updateData.percentualeCompletamento !== undefined)
      params.percentualeCompletamento =
        updateData.percentualeCompletamento.toString();
    if (updateData.oreCompletate !== undefined)
      params.oreCompletate = updateData.oreCompletate.toString();
    if (updateData.valutazione !== undefined)
      params.valutazione = updateData.valutazione.toString();
    if (updateData.noteFeedback !== undefined)
      params.noteFeedback = updateData.noteFeedback;
    if (updateData.competenzeAcquisite !== undefined)
      params.competenzeAcquisite = updateData.competenzeAcquisite;
    if (updateData.certificatoOttenuto !== undefined)
      params.certificatoOttenuto = updateData.certificatoOttenuto.toString();
    if (updateData.dataTerminePrevista !== undefined)
      params.dataTerminePrevista = updateData.dataTerminePrevista;
    if (updateData.esito !== undefined)
      params.esito = updateData.esito;
    if (updateData.fonteRichiesta !== undefined)
      params.fonteRichiesta = updateData.fonteRichiesta;
    if (updateData.impattoIsms !== undefined)
      params.impattoIsms = updateData.impattoIsms.toString();
    if (updateData.attestato !== undefined)
      params.attestato = updateData.attestato.toString();
    if (updateData.dataInizio !== undefined)
      params.dataInizio = updateData.dataInizio;
    if (updateData.dataCompletamento !== undefined)
      params.dataCompletamento = updateData.dataCompletamento;
    if (updateData.feedbackFornito !== undefined)
      params.feedbackFornito = updateData.feedbackFornito.toString();
    if (updateData.modalita !== undefined) 
      params.modalita = updateData.modalita;

    console.log('Sending PUT request with params:', params);
    const url = `http://${this.server}:${this.port}/api/assegnazioni/${assegnazioneId}`;
    console.log('URL:', url);

    return this.httpClient.put<IAssegnazione>(url, null, { 
      params,
      observe: 'response'
    }).pipe(
      map((response: HttpResponse<IAssegnazione>) => {
        console.log('Full HTTP response:', response);
        console.log('Response status:', response.status);
        console.log('Response body:', response.body);
        return response.body!;
      }),
      catchError((error: any) => {
        console.error('Raw HTTP error in service:', error);
        console.error('Error status:', error.status);
        console.error('Error statusText:', error.statusText);
        console.error('Error message:', error.message);
        console.error('Error error:', error.error);
        console.error('Error type:', typeof error);
        console.error('Error constructor:', error.constructor.name);
        
        // Re-throw the original error to bypass the interceptor transformation
        throw error;
      })
    );
  };

  // Recupera tutte le assegnazioni con filtri
  getAllAssegnazioni = (
    stato?: AssegnazioneStato,
    soloObbligatorie: boolean = false,
    richiedeFeedback: boolean = false,
  ) =>
    this.httpClient.get<IAssegnazione[]>(
      `http://${this.server}:${this.port}/api/assegnazioni`,
      {
        params: {
          ...(stato && { stato }),
          soloObbligatorie: soloObbligatorie.toString(),
          richiedeFeedback: richiedeFeedback.toString(),
        },
      },
    );

  // Elimina un'assegnazione
  deleteAssegnazione = (assegnazioneId: number) =>
    this.httpClient.delete<void>(
      `http://${this.server}:${this.port}/api/assegnazioni/${assegnazioneId}`,
    );

  // Metodi di utilità per le statistiche
  getAssegnazioniStats = () =>
    this.httpClient.get<any>(
      `http://${this.server}:${this.port}/api/assegnazioni/stats`,
    );

  // Importazione massiva di assegnazioni
  bulkImport = (importData: any) =>
    this.httpClient.post<any>(
      `http://${this.server}:${this.port}/api/assegnazioni/bulk-import`,
      importData,
    );

  // AGGIUNGI questo metodo alla fine della classe AssegnazioniService
  createMultipleAssegnazioni = (data: {
    dipendentiIds: number[];
    corsiIds: number[];  // AGGIUNGI
    obbligatorio: boolean;
    dataTerminePrevista?: string;
  }) =>
    this.httpClient.post<IAssegnazione[]>(
      `http://${this.server}:${this.port}/api/assegnazioni/assegnazioneMultipla`,
      data
    );
}
