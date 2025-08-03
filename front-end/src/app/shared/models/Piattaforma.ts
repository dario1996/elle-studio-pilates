export interface IPiattaforma {
  id: number;
  nome: string;
  descrizione: string;
  urlSito: string;
  dataCreazione: string;      // ISO string (es: "2024-06-25T10:00:00")
  dataModifica?: string | null;
  attiva: boolean;
  // corsi?: any[]; // opzionale, se vuoi includere la lista corsi
}