import { IColumnDef } from '../models/ui/column-def';
import { IAzioneDef, AzioneType, AzioneColor } from '../models/ui/azione-def';
import { IFiltroDef } from '../models/ui/filtro-def';
import { ButtonConfig } from '../../core/page-title/page-title.component';

export const CORSI_COLUMNS: IColumnDef[] = [
  { key: 'nome', label: 'Nome', sortable: true, type: 'text', maxLength: 9999 },
  { key: 'categoria', label: 'Categoria', sortable: true, type: 'text', maxLength: 9999 },
  { key: 'livello', label: 'Livello', sortable: true, type: 'text', maxLength: 9999 },
  { key: 'durataMinuti', label: 'Durata (min)', sortable: true, type: 'text', maxLength: 9999 },
  { key: 'maxPartecipanti', label: 'Max Partecipanti', sortable: true, type: 'text', maxLength: 9999 },
  { key: 'prezzo', label: 'Prezzo (€)', sortable: true, type: 'text', maxLength: 9999 },
  { key: 'attivo', label: 'Attivo', sortable: true, type: 'badge', statusType: 'boolean' },
];

export const CORSI_AZIONI: IAzioneDef[] = [
  {
    label: 'Modifica',
    icon: 'fa fa-pen',
    action: AzioneType.Edit,
    color: AzioneColor.Secondary,
  },
  {
    label: 'Elimina',
    icon: 'fa fa-trash',
    action: AzioneType.Delete,
    color: AzioneColor.Danger,
  },
];

export const CORSI_FILTRI: IFiltroDef[] = [
  {
    key: 'nome',
    label: 'Nome',
    type: 'text',
    placeholder: 'Cerca nome...',
    colClass: 'col-12 col-md-4 col-lg-3 mb-2',
  },
  {
    key: 'categoria',
    label: 'Categoria',
    type: 'select',
    options: [
      { value: '', label: 'Tutte' },
      { value: 'PRIMA_LEZIONE', label: 'Prima Lezione' },
      { value: 'PRIVATA', label: 'Privata' },
      { value: 'SEMI_PRIVATA', label: 'Semi Privata' },
      { value: 'GRUPPO_MAT', label: 'Matwork' },
      { value: 'COMBO', label: 'Combo' },
      { value: 'YOGA', label: 'Yoga' },
    ],
    colClass: 'col-12 col-md-4 col-lg-3 mb-2',
  },
  {
    key: 'livello',
    label: 'Livello',
    type: 'select',
    options: [
      { value: '', label: 'Tutti' },
      { value: 'PRINCIPIANTE', label: 'Principiante' },
      { value: 'INTERMEDIO', label: 'Intermedio' },
      { value: 'AVANZATO', label: 'Avanzato' },
      { value: 'TUTTI', label: 'Tutti i livelli' },
    ],
    colClass: 'col-6 col-md-3 col-lg-2 mb-2',
  },
  {
    key: 'attivo',
    label: 'Stato',
    type: 'select',
    options: [
      { value: '', label: 'Tutti' },
      { value: 'true', label: 'Attivo' },
      { value: 'false', label: 'Non Attivo' },
    ],
    colClass: 'col-6 col-md-4 col-lg-3 mb-2',
  },
];

export const CORSI_AZIONI_PAGINA: 
ButtonConfig[] = [
  {
      text: 'Filtri',
      icon: 'fas fa-filter',
      class: 'btn-secondary',
      action: 'filter',
    },
    {
      text: 'Nuovo Corso',
      icon: 'fas fa-plus',
      class: 'btn-primary',
      action: 'add',
    },
];