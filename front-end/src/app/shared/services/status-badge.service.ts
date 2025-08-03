import { Injectable } from '@angular/core';

export interface StatusBadgeConfig {
  value: string;
  displayText: string;
  colorClass: string;
}

export interface StatusTypeConfig {
  [key: string]: StatusBadgeConfig[];
}

@Injectable({
  providedIn: 'root'
})
export class StatusBadgeService {
  private readonly statusConfigs: StatusTypeConfig = {
    assegnazione: [
      { value: 'Da iniziare', displayText: 'Da iniziare', colorClass: 'status-badge-info' },
      { value: 'In corso', displayText: 'In corso', colorClass: 'status-badge-warning' },
      { value: 'Terminato', displayText: 'Terminato', colorClass: 'status-badge-success' },
      { value: 'Interrotto', displayText: 'Interrotto', colorClass: 'status-badge-danger' }
    ],
    dipendente: [
      { value: 'Attivo', displayText: 'Attivo', colorClass: 'status-badge-success' },
      { value: 'Non attivo', displayText: 'Non attivo', colorClass: 'status-badge-secondary' }
    ],
    attestato: [
      { value: 'SI', displayText: 'SI', colorClass: 'status-badge-success' },
      { value: 'NO', displayText: 'NO', colorClass: 'status-badge-secondary' }
    ],
    corso: [
      { value: 'Attivo', displayText: 'Attivo', colorClass: 'status-badge-success' },
      { value: 'Non attivo', displayText: 'Non attivo', colorClass: 'status-badge-secondary' },
      { value: 'Scaduto', displayText: 'Scaduto', colorClass: 'status-badge-danger' }
    ],
    general: [
      { value: 'Attivo', displayText: 'Attivo', colorClass: 'status-badge-success' },
      { value: 'Non attivo', displayText: 'Non attivo', colorClass: 'status-badge-secondary' },
      { value: 'Terminato', displayText: 'Terminato', colorClass: 'status-badge-success' },
      { value: 'In corso', displayText: 'In corso', colorClass: 'status-badge-warning' },
      { value: 'Da iniziare', displayText: 'Da iniziare', colorClass: 'status-badge-info' },
      { value: 'Interrotto', displayText: 'Interrotto', colorClass: 'status-badge-danger' },
      { value: 'SI', displayText: 'SI', colorClass: 'status-badge-success' },
      { value: 'NO', displayText: 'NO', colorClass: 'status-badge-secondary' },
      { value: 'Si', displayText: 'Si', colorClass: 'status-badge-success' },
      { value: 'No', displayText: 'No', colorClass: 'status-badge-secondary' },
      { value: '–', displayText: '–', colorClass: 'status-badge-secondary' }
    ],
    esito: [
      { value: 'Superato', displayText: 'Superato', colorClass: 'status-badge-success' },
      { value: 'In corso', displayText: 'In corso', colorClass: 'status-badge-warning' },
      { value: 'Non superato', displayText: 'Non superato', colorClass: 'status-badge-danger' }
    ],
  };

  /**
   * Get status configuration for a specific type
   */
  getStatusConfig(statusType: string): StatusBadgeConfig[] {
    return this.statusConfigs[statusType] || this.statusConfigs['general'];
  }

  /**
   * Get configuration for a specific status value and type
   */
  getStatusBadgeConfig(value: string, statusType: string = 'general'): StatusBadgeConfig {
    const configs = this.getStatusConfig(statusType);
    const config = configs.find(c => c.value === value);
    
    if (config) {
      return config;
    }
    
    // Default fallback
    return {
      value: value,
      displayText: value,
      colorClass: 'status-badge-secondary'
    };
  }

  /**
   * Add or update a status configuration
   */
  addStatusConfig(statusType: string, config: StatusBadgeConfig): void {
    if (!this.statusConfigs[statusType]) {
      this.statusConfigs[statusType] = [];
    }
    
    const existingIndex = this.statusConfigs[statusType].findIndex(c => c.value === config.value);
    if (existingIndex !== -1) {
      this.statusConfigs[statusType][existingIndex] = config;
    } else {
      this.statusConfigs[statusType].push(config);
    }
  }

  /**
   * Get all available status types
   */
  getAvailableStatusTypes(): string[] {
    return Object.keys(this.statusConfigs);
  }

  /**
   * Get CSS class for a specific status value and type
   */
  getStatusCssClass(value: string, statusType: string = 'general'): string {
    const config = this.getStatusBadgeConfig(value, statusType);
    return config.colorClass;
  }

  /**
   * Get display text for a specific status value and type
   */
  getStatusDisplayText(value: string, statusType: string = 'general'): string {
    const config = this.getStatusBadgeConfig(value, statusType);
    return config.displayText;
  }
}
