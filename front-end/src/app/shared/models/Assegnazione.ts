import { IDipendenti } from './Dipendenti';
import { ICorsi } from './Corsi';

export interface IAssegnazione {
  id: number;
  dipendente: IDipendenti;
  corso: ICorsi;
  dataAssegnazione: string;
  dataTerminePrevista: string;
  dataInizio: string;
  dataCompletamento: string;
  percentualeCompletamento: number;
  oreCompletate: number;
  stato: AssegnazioneStato;
  obbligatorio: boolean;
  feedbackFornito: boolean;
  valutazione: number;
  noteFeedback: string;
  competenzeAcquisite: string;
  certificatoOttenuto: boolean;
  esito: string;
  fonteRichiesta: string;
  impattoIsms: boolean;
  attestato: boolean;
  dataCreazione: string;
  dataModifica: string;
}

export enum AssegnazioneStato {
  DA_INIZIARE = 'DA_INIZIARE',
  IN_CORSO = 'IN_CORSO',
  TERMINATO = 'TERMINATO',
  INTERROTTO = 'INTERROTTO',
}

export interface AssegnazioneCreateRequest {
  dipendenteId: number;
  corsoId: number;
  obbligatorio?: boolean;
}

export interface AssegnazioneUpdateRequest {
  stato?: AssegnazioneStato;
  percentualeCompletamento?: number;
  oreCompletate?: number;
  feedbackFornito?: boolean;
  valutazione?: number;
  noteFeedback?: string;
  competenzeAcquisite?: string;
  certificatoOttenuto?: boolean;
  esito?: string;
  fonteRichiesta?: string;
  impattoIsms?: boolean;
  attestato?: boolean;
  dataInizio?: string;
  dataCompletamento?: string;
  dataTerminePrevista?: string;
  modalita?: string;
}
