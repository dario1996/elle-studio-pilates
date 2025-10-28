import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationComponent } from '../../../../core/notification/notification.component';
import { LoggedUserComponent } from '../../../../shared/components/logged-user/logged-user.component';
import { PageTitleComponent } from '../../../../core/page-title/page-title.component';
import { AuthJwtService } from '../../../../core/services/authJwt.service';
import { PacchettiService, Pacchetto } from '../../../../core/services/pacchetti.service';
import { inject } from '@angular/core';

@Component({
  selector: 'app-gestione-pacchetti',
  standalone: true,
  templateUrl: './gestione-pacchetti.component.html',
  styleUrls: ['./gestione-pacchetti.component.css'],
  imports: [CommonModule, PageTitleComponent, NotificationComponent, LoggedUserComponent],
})
export class GestionePacchettiComponent implements OnInit {
  private auth = inject(AuthJwtService);
  private pacchettiService = inject(PacchettiService);

  title: string = 'Gestione Pacchetti';

  // Toast notification properties
  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'error' | 'info' = 'success';
  toastIcon = '';
  private toastTimeout?: number;

  // Pacchetti
  pacchettiAcquistati: any[] = [];
  pacchettiDisponibili: Pacchetto[] = [];
  loadingPacchetti = false;

  ngOnInit(): void {
    this.loadMockPacchettiAcquistati();
    this.loadPacchettiDisponibili();
  }

  // Carica pacchetti acquistati (mock data per ora)
  private loadMockPacchettiAcquistati(): void {
    // Mock data - verrà sostituito con chiamata API reale
    this.pacchettiAcquistati = [
      {
        id: 1,
        pacchettoNome: 'Pilates Base - Pacchetto 10 lezioni',
        categoria: 'PILATES',
        lezioniTotali: 10,
        lezioniRimaste: 7,
        dataAcquisto: '2025-09-15',
        dataScadenza: '2025-12-15',
        prezzo: 200.00,
        stato: 'ATTIVO'
      },
      {
        id: 2,
        pacchettoNome: 'Yoga Rilassante - Pacchetto 5 lezioni',
        categoria: 'YOGA',
        lezioniTotali: 5,
        lezioniRimaste: 2,
        dataAcquisto: '2025-08-20',
        dataScadenza: '2025-11-20',
        prezzo: 150.00,
        stato: 'ATTIVO'
      },
      {
        id: 3,
        pacchettoNome: 'Matwork Avanzato - Pacchetto Mensile',
        categoria: 'MATWORK',
        lezioniTotali: 12,
        lezioniRimaste: 0,
        dataAcquisto: '2025-07-01',
        dataScadenza: '2025-08-01',
        prezzo: 350.00,
        stato: 'SCADUTO'
      }
    ];
  }

  // Carica pacchetti disponibili dalla tabella pacchetti
  private loadPacchettiDisponibili(): void {
    this.loadingPacchetti = true;
    this.pacchettiService.getPacchettiAttivi().subscribe({
      next: (pacchetti) => {
        this.pacchettiDisponibili = pacchetti;
        this.loadingPacchetti = false;
      },
      error: (error) => {
        console.error('Errore nel caricamento dei pacchetti disponibili:', error);
        this.loadingPacchetti = false;
        this.showToastMessage('Errore nel caricamento dei pacchetti disponibili', 'error');
      }
    });
  }

  // Formatta la data in formato italiano
  formatDate(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  // Calcola la percentuale di utilizzo del pacchetto
  getUsagePercentage(pacchetto: any): number {
    if (!pacchetto.lezioniTotali) return 0;
    const used = pacchetto.lezioniTotali - pacchetto.lezioniRimaste;
    return Math.round((used / pacchetto.lezioniTotali) * 100);
  }

  // Verifica se il pacchetto sta per scadere (entro 30 giorni)
  isExpiringSoon(dataScadenza: string): boolean {
    if (!dataScadenza) return false;
    const scadenza = new Date(dataScadenza);
    const oggi = new Date();
    const giorni = Math.ceil((scadenza.getTime() - oggi.getTime()) / (1000 * 60 * 60 * 24));
    return giorni > 0 && giorni <= 30;
  }

  // Acquista un pacchetto (placeholder)
  acquistaPacchetto(pacchetto: Pacchetto): void {
    this.showToastMessage(`Funzionalità acquisto pacchetto "${pacchetto.nome}" in sviluppo`, 'info');
    // TODO: Implementare la logica di acquisto pacchetto
  }

  // Toast notification methods
  showToastMessage(message: string, type: 'success' | 'error' | 'info' = 'success') {
    this.toastMessage = message;
    this.toastType = type;
    this.toastIcon = type === 'success' ? 'success' : type === 'error' ? 'error' : 'info';
    this.showToast = true;
    
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
    this.toastTimeout = window.setTimeout(() => {
      this.hideToast();
    }, 3000);
  }
  
  hideToast() {
    this.showToast = false;
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
  }
}
