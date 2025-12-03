import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationComponent } from '../../../../core/notification/notification.component';
import { LoggedUserComponent } from '../../../../shared/components/logged-user/logged-user.component';
import { PageTitleComponent } from '../../../../core/page-title/page-title.component';
import { AuthJwtService } from '../../../../core/services/authJwt.service';
import { UserService } from '../../../../core/services/data/user.service';
import { PacchettiService, Pacchetto } from '../../../../core/services/pacchetti.service';
import { VenditeService, PacchettoAcquistato, VenditaRequest } from '../../../../shared/services/vendite.service';
import { ToastrUniversaleService } from '../../../../shared/services/toastr-universale.service';
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
  private toastr = inject(ToastrUniversaleService);

  title: string = 'Gestione Pacchetti';

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
      this.toastr.error('Utente non autenticato');
      return;
    }
    
    this.venditeService.getPacchettiAcquistatiByUtente(username).subscribe({
      next: (pacchetti) => {
        // Ordina i pacchetti per data di acquisto (dal più recente al meno recente)
        this.pacchettiAcquistati = (pacchetti || []).sort((a, b) => {
          const dataA = new Date(a.dataAcquisto).getTime();
          const dataB = new Date(b.dataAcquisto).getTime();
          return dataB - dataA; // Ordine decrescente (più recente prima)
        });
        console.log('Pacchetti acquistati:', this.pacchettiAcquistati);
        this.loadingAcquistati = false;
      },
      error: (error) => {
        console.error('Errore nel caricamento dei pacchetti acquistati:', error);
        this.loadingAcquistati = false;
        this.toastr.error('Errore nel caricamento dei pacchetti acquistati');
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
      this.toastr.error('Utente non autenticato');
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
            this.toastr.error('Errore nel caricamento dei pacchetti disponibili');
          }
        });
      },
      error: (error) => {
        console.error('Errore nel recupero dei dati utente:', error);
        this.loadingPacchetti = false;
        this.toastr.error('Errore nel recupero dati utente');
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

  // Formatta la data e ora in formato breve
  formatDateTimeShort(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }) + ' ' + date.toLocaleTimeString('it-IT', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Calcola la percentuale di utilizzo del pacchetto
  getUsagePercentage(pacchetto: PacchettoAcquistato): number {
    if (!pacchetto.lezioniTotali) return 0;
    const percentuale = Math.round((pacchetto.lezioniPrenotate / pacchetto.lezioniTotali) * 100);
    return percentuale;
  }

  // Acquista un pacchetto (pagamento fake)
  acquistaPacchetto(pacchetto: Pacchetto): void {
    const username = this.auth.loggedUser();
    
    if (!username) {
      this.toastr.error('Utente non autenticato');
      return;
    }

    // Simula un pagamento fake - crea direttamente una vendita con stato PAID
    this.userService.getUtenteByUsername(username).subscribe({
      next: (utente) => {
        // Usa la struttura VenditaRequest che si aspetta il backend
        const vendita: VenditaRequest = {
          id: utente.id,  // ID utente (Long)
          pacchettoId: pacchetto.id,  // ID pacchetto (Long)
          importo: pacchetto.prezzo,  // BigDecimal
          note: 'Pagamento fake - Acquisto dal portale utente'
        };

        this.venditeService.creaVendita(vendita).subscribe({
          next: (venditaCreata) => {
            this.toastr.success(`Pacchetto "${pacchetto.nome}" acquistato con successo!`);
            
            // Ricarica i pacchetti acquistati e disponibili
            setTimeout(() => {
              this.loadPacchettiAcquistati();
              this.loadPacchettiDisponibili();
            }, 500);
          },
          error: (error) => {
            console.error('Errore durante l\'acquisto:', error);
            this.toastr.error('Errore durante l\'acquisto del pacchetto. Riprova più tardi.');
          }
        });
      },
      error: (error) => {
        console.error('Errore nel recupero dati utente:', error);
        this.toastr.error('Errore nel recupero dati utente');
      }
    });
  }

  // Toggle visibilità descrizione pacchetto
  toggleDescrizioneVisibile(pacchettoId: number): void {
    this.descrizioneVisibile[pacchettoId] = !this.descrizioneVisibile[pacchettoId];
  }

  // Converte il nome della categoria in una classe CSS valida (rimuove underscore)
  getBadgeClass(categoria: string): string {
    return 'badge-' + categoria.toLowerCase().replace(/_/g, '');
  }
}
