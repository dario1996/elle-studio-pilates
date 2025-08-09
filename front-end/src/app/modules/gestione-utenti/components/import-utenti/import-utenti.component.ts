import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-import-utenti',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './import-utenti.component.html',
  styleUrl: './import-utenti.component.css'
})
export class ImportUtentiComponent {
  
  /* 
   * COMPONENTE DI IMPORT UTENTI
   * 
   * Questo componente sarà utilizzato in futuro per permettere
   * l'importazione in massa degli utenti tramite file Excel/CSV.
   * 
   * Funzionalità previste:
   * - Upload file Excel/CSV
   * - Validazione dati
   * - Preview degli utenti da importare
   * - Gestione errori di validazione
   * - Import con feedback di progresso
   * 
   * Al momento è disabilitato come richiesto.
   */

  constructor() {
    console.log('ImportUtentiComponent inizializzato (feature disabilitata)');
  }

}
