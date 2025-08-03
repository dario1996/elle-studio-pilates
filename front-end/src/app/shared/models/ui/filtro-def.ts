export interface IFiltroDef {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'number' | 'checkbox';
  options?: { value: any; label: string }[]; // solo per select
  placeholder?: string;
  colClass?: string; // per il layout responsive
}