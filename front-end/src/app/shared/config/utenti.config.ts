import { IColumnDef } from '../models/ui/column-def';
import { IAzioneDef, AzioneType, AzioneColor } from '../models/ui/azione-def';
import { IFiltroDef } from '../models/ui/filtro-def';

export const UTENTI_COLUMNS: IColumnDef[] = [
  { 
    key: 'nominativo', 
    label: 'Nominativo', 
    sortable: true, 
    type: 'text' 
  },
  { 
    key: 'username', 
    label: 'Username', 
    sortable: true, 
    type: 'text' 
  },
  { 
    key: 'email', 
    label: 'Email', 
    sortable: true, 
    type: 'text' 
  },
  { 
    key: 'ruoli', 
    label: 'Ruoli', 
    sortable: true, 
    type: 'text' 
  },
  { 
    key: 'attivo', 
    label: 'Stato', 
    sortable: true, 
    type: 'badge',
    statusType: 'utente'
  },
  { 
    key: 'dataCreazione', 
    label: 'Data Creazione', 
    sortable: true, 
    type: 'date' 
  }
];

export const UTENTI_AZIONI: IAzioneDef[] = [
  // {
  //   label: 'Dettagli',
  //   icon: 'fa fa-eye',
  //   action: AzioneType.View,
  //   color: AzioneColor.Primary,
  // },
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
  {
    label: 'Disattiva',
    icon: 'fa fa-user-slash',
    action: AzioneType.Disable,
    color: AzioneColor.Warning,
  },
];

export const UTENTI_FILTRI: IFiltroDef[] = [
  {
    key: 'nominativo',
    label: 'Nominativo',
    type: 'text',
    placeholder: 'Cerca nominativo...',
    colClass: 'col-12 col-md-4 col-lg-3 mb-2',
  },
  {
    key: 'username',
    label: 'Username',
    type: 'text',
    placeholder: 'Cerca username...',
    colClass: 'col-12 col-md-4 col-lg-3 mb-2',
  },
  {
    key: 'email',
    label: 'Email',
    type: 'text',
    placeholder: 'Cerca email...',
    colClass: 'col-12 col-md-4 col-lg-3 mb-2',
  },
  {
    key: 'ruoli',
    label: 'Ruoli',
    type: 'select',
    options: [
      { value: '', label: 'Tutti' },
      { value: 'utente', label: 'Utente' },
      { value: 'amministratore', label: 'Amministratore' },
    ],
    colClass: 'col-6 col-md-3 col-lg-2 mb-2',
  },
  {
    key: 'attivo',
    label: 'Stato',
    type: 'select',
    options: [
      { value: '', label: 'Tutti' },
      { value: 'Si', label: 'Attivo' },
      { value: 'No', label: 'Non attivo' },
    ],
    colClass: 'col-6 col-md-3 col-lg-2 mb-2',
  },
];

export const UTENTI_SEARCH_FIELDS = [
  { key: 'nominativo', placeholder: 'Cerca Utente' }
];
