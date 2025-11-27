import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationComponent } from '../../../../core/notification/notification.component';
import { LoggedUserComponent } from '../../../../shared/components/logged-user/logged-user.component';
import { PageTitleComponent } from '../../../../core/page-title/page-title.component';
import { AuthJwtService } from '../../../../core/services/authJwt.service';
import { UserService } from '../../../../core/services/data/user.service';
import { PacchettiService, Pacchetto } from '../../../../core/services/pacchetti.service';
import { VenditeService, PacchettoAcquistato } from '../../../../shared/services/vendite.service';
import { inject } from '@angular/core';

@Component({
  selector: 'app-gestione-pacchetti',
  standalone: true,
  templateUrl: './gestione-pacchetti.component.html',
  styleUrls: ['./gestione-pacchetti.component.css'],
  imports:[
  CommonModule, 
  PageTitleComponent, 
  // NotificationComponent, 
  LoggedUserComponent],
})
export class GestionePacchettiComponent implements OnInit {
  private auth = inject(AuthJwtService);
  private userService = inject(UserService);
  private pacchettiService = inject(PacchettiService);
  private venditeService = inject(VenditeService);

  title: string = 'Gestione Pacchetti';

  // Toast notification properties
  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'error' | 'info' = 'success';
  toastIcon = '';
  private toastTimeout?: number;

  // Pacchetti
  pacchettiAcquistati: PacchettoAcquistato[] = [];
  pacchettiDisponibili: Pacchetto[] = [];
  loadingPacchetti = false;
  loadingAcquistati = false;
  
  // Traccia quali descrizioni sono visibili
  descrizioneVisibile: { [key: number]: boolean } = {};

  ngOnInit(): void {
    this.loadPacchettiAcquistati();
    this.loadPacchettiDisponibili();
  }

  // Carica pacchetti acquistati (PAID) dall'utente loggato
  private loadPacchettiAcquistati(): void {
    this.loadingAcquistati = true;
    
    const username = this.auth.loggedUser();
    
    if (!username) {
      console.error('Username non trovato');
      this.loadingAcquistati = false;
      this.showToastMessage('Errore: utente non autenticato', 'error');
      return;
    }
    
    this.venditeService.getPacchettiAcquistatiByUtente(username).subscribe({
      next: (pacchetti) => {
        this.pacchettiAcquistati = pacchetti || [];
        console.log('Pacchetti acquistati:', this.pacchettiAcquistati);
        this.loadingAcquistati = false;
      },
      error: (error) => {
        console.error('Errore nel caricamento dei pacchetti acquistati:', error);
        this.loadingAcquistati = false;
        this.showToastMessage('Errore nel caricamento dei pacchetti acquistati', 'error');
      }
    });
  }

  // Carica pacchetti disponibili per l'utente dalla tabella utente_pacchetti_disponibili
  private loadPacchettiDisponibili(): void {
    this.loadingPacchetti = true;
    
    const username = this.auth.loggedUser();
    
    if (!username) {
      console.error('Username non trovato');
      this.loadingPacchetti = false;
      this.showToastMessage('Errore: utente non autenticato', 'error');
      return;
    }
    
    // Prima recupera i dati dell'utente per ottenere l'ID
    this.userService.getUtenteByUsername(username).subscribe({
      next: (utente) => {
        // Ora usa l'ID per recuperare i pacchetti disponibili
        this.pacchettiService.getPacchettiDisponibiliPerUtente(utente.id).subscribe({
          next: (pacchetti) => {
            this.pacchettiDisponibili = pacchetti || [];
            this.loadingPacchetti = false;
          },
          error: (error) => {
            console.error('Errore nel caricamento dei pacchetti disponibili:', error);
            this.loadingPacchetti = false;
            this.showToastMessage('Errore nel caricamento dei pacchetti disponibili', 'error');
          }
        });
      },
      error: (error) => {
        console.error('Errore nel recupero dati utente:', error);
        this.loadingPacchetti = false;
        this.showToastMessage('Errore nel recupero dati utente', 'error');
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
  getUsagePercentage(pacchetto: PacchettoAcquistato): number {
    if (!pacchetto.lezioniTotali) return 0;
    const percentuale = Math.round((pacchetto.lezioniPrenotate / pacchetto.lezioniTotali) * 100);
    return percentuale;
  }

  // Acquista un pacchetto (placeholder)
  acquistaPacchetto(pacchetto: Pacchetto): void {
    this.showToastMessage(`Funzionalità acquisto pacchetto "${pacchetto.nome}" in sviluppo`, 'info');
    // TODO: Implementare la logica di acquisto pacchetto
  }

  // Toggle visibilità descrizione pacchetto
  toggleDescrizioneVisibile(pacchettoId: number): void {
    this.descrizioneVisibile[pacchettoId] = !this.descrizioneVisibile[pacchettoId];
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
