export interface IColumnDef {
  key: string;
  label: string;
  type?: 'text' | 'badge' | 'date' | 'custom';
  sortable?: boolean;
  width?: string;
  statusType?: string; // For badge type columns - specifies which status configuration to use
  maxLength?: number; // Maximum length for text truncation (default: 30)
}