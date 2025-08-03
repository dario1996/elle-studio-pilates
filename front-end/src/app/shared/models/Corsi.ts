import { IPiattaforma } from "./Piattaforma";

export interface ICorsi {
    toLowerCase(): unknown;
    id: number;
    nome: string;
    categoria: string;
    argomento: string;
    modulo: string;
    formatiRichiedenti: string;
    durata: number;
    dataInizio: string;
    dataFine: string;
    dataScadenza: string;
    ore: number;
    oreRimanenti: number;
    stato: string;
    priorita: string;
    codiceCorso: string;
    idContenutoLinkedin: string;
    urlCorso: string;
    costo: number;
    certificazioneRilasciata: boolean;
    feedbackRichiesto: boolean;
    dataCreazione: string;
    dataModifica: string;
    piattaforma: IPiattaforma
}