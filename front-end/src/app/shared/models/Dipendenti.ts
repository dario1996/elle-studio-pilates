export interface IDipendenti {
  toLowerCase(): unknown;
  id: number;
  nome: string;
  cognome: string;
  email: string;
  commerciale: string;
  azienda: string;
  ruolo: string;
  reparto: string;
  dataAssunzione: string;
  dataCessazione?: string;
  codiceDipendente: string;
  isms?: string;
  sede?: string;
  community?: string;
  responsabile?: string;
  attivo: boolean;
  dataCreazione: string;
  dataModifica: string;
}

export interface DipendenteCreateRequest {
  nome: string;
  cognome: string;
  email: string;
  codiceDipendente: string;
  reparto: string;
  commerciale: string;
  azienda: string;
  ruolo: string;
  isms?: string;
  sede?: string;
  community?: string;
  responsabile?: string;
}
