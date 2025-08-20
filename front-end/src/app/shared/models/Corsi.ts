export interface ICorsi {
    id: number;
    nome: string;
    descrizione?: string;
    categoria: string; // PILATES, YOGA, MATWORK, etc.
    livello: string; // PRINCIPIANTE, INTERMEDIO, AVANZATO
    durataMinuti: number; // Durata in minuti
    maxPartecipanti: number;
    prezzo: number;
    attivo: boolean;
    dataCreazione: string;
    dataModifica?: string;
}