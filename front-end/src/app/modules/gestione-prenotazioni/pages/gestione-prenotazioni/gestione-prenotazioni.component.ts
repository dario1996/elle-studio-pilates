import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoggedUserComponent } from '../../../../shared/components/logged-user/logged-user.component';
import { PageTitleComponent } from '../../../../core/page-title/page-title.component';
import { NotificationComponent } from '../../../../core/notification/notification.component';
import { AuthJwtService } from '../../../../core/services/authJwt.service';
import { inject } from '@angular/core';
import { PrenotazioneService } from '../../../../shared/services/prenotazione.service';
import { LezioneDisponibile, PrenotazioneLezioneResponse, TipoLezione, Pacchetto } from '../../../../shared/models/prenotazione.model';

@Component({
  selector: 'app-gestione-prenotazioni',
  templateUrl: './gestione-prenotazioni.component.html',
  styleUrls: ['./gestione-prenotazioni.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PageTitleComponent, LoggedUserComponent],
})
export class GestionePrenotazioniComponent implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthJwtService);
  private prenotazioneService = inject(PrenotazioneService);

  title: string = 'Prenotazioni';
  
  prenotazioneForm: FormGroup;
  pacchetti: Pacchetto[] = [];
  selectedPacchetto: Pacchetto | null = null;
  tipiLezione: TipoLezione[] = [];
  selectedTipoLezione: TipoLezione | null = null;
  lezioniDisponibili: LezioneDisponibile[] = [];
  selectedLezione: LezioneDisponibile | null = null;
  loading = false;
  error: string | null = null;
  successMessage: string | null = null;
  
  // Toast notification properties
  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'error' | 'info' = 'success';
  toastIcon = '';
  private toastTimeout?: number;

  // Modal gestione prenotazioni
  showGestioneModal = false;
  prenotazioniUtente: PrenotazioneLezioneResponse[] = [];

  constructor() {
    this.prenotazioneForm = this.fb.group({
      pacchetto: ['', Validators.required],
      tipoLezione: ['', Validators.required],
      lezione: ['', Validators.required],
      note: ['']
    });
  }

  ngOnInit(): void {
    this.caricaPacchetti();
    this.caricaPrenotazioniUtente();
  }

  caricaPacchetti(): void {
    this.loading = true;
    console.log('Caricamento pacchetti utente...');
    this.prenotazioneService.getPacchettiUtente().subscribe({
      next: (pacchetti) => {
        console.log('Pacchetti ricevuti:', pacchetti);
        this.pacchetti = pacchetti;
        this.loading = false;
        if (pacchetti.length === 0) {
          console.warn('Nessun pacchetto trovato per questo utente');
          this.showToastMessage('Non hai ancora acquistato nessun pacchetto', 'info');
        }
      },
      error: (error) => {
        console.error('Errore durante il caricamento dei pacchetti', error);
        console.error('Dettaglio errore:', error.error);
        console.error('Status:', error.status);
        this.showToastMessage('Errore durante il caricamento dei pacchetti acquistati', 'error');
        this.loading = false;
      }
    });
  }

  onPacchettoChange(event: any): void {
    const pacchettoId = parseInt(event.target.value);
    this.selectedPacchetto = this.pacchetti.find(p => p.id === pacchettoId) || null;
    
    // Reset selezioni successive
    this.selectedTipoLezione = null;
    this.selectedLezione = null;
    this.lezioniDisponibili = [];
    this.tipiLezione = [];
    this.prenotazioneForm.patchValue({
      tipoLezione: '',
      lezione: ''
    });
    
    if (this.selectedPacchetto) {
      this.caricaTipiLezionePerPacchetto();
    }
  }

  caricaTipiLezionePerPacchetto(): void {
    if (!this.selectedPacchetto) return;
    
    this.loading = true;
    this.prenotazioneService.getTipiLezionePerPacchetto(this.selectedPacchetto.id).subscribe({
      next: (tipi) => {
        this.tipiLezione = tipi;
        this.loading = false;
      },
      error: (error) => {
        console.error('Errore durante il caricamento dei tipi lezione', error);
        this.showToastMessage('Errore durante il caricamento dei tipi lezione per questo pacchetto', 'error');
        this.loading = false;
      }
    });
  }

  onTipoLezioneChange(event: any): void {
    const tipoLezioneId = parseInt(event.target.value);
    this.selectedTipoLezione = this.tipiLezione.find(t => t.id === tipoLezioneId) || null;
    
    if (this.selectedTipoLezione) {
      this.caricaLezioniPerTipo();
    }
  }

  caricaLezioniPerTipo(): void {
    if (!this.selectedTipoLezione) return;
    
    this.loading = true;
    this.lezioniDisponibili = [];
    
    // Carica lezioni per le prossime 4 settimane
    const oggi = new Date();
    const dataInizio = oggi.toISOString().split('T')[0];
    const dataFine = new Date(oggi.getTime() + (28 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0];
    
    this.prenotazioneService.getLezioniPerTemplate(this.selectedTipoLezione.id, dataInizio, dataFine).subscribe({
      next: (lezioni) => {
        this.lezioniDisponibili = lezioni;
        this.loading = false;
      },
      error: (error) => {
        console.error('Errore durante il caricamento delle lezioni', error);
        this.showToastMessage('Errore durante il caricamento delle lezioni', 'error');
        this.loading = false;
      }
    });
  }

  onLezioneChange(event: any): void {
    const lezioneId = parseInt(event.target.value);
    this.selectedLezione = this.lezioniDisponibili.find(l => l.lezioneId === lezioneId) || null;
  }

  selectOrario(orario: string): void {
    // Metodo deprecato - ora le lezioni hanno già l'orario dalla tabella
  }

  isOrarioDisponibile(orario: string): boolean {
    // Metodo deprecato
    return true;
  }

  getOrarioInfo(orario: string): { disponibile: boolean; postiRimasti: number; postiTotali: number } | null {
    // Metodo deprecato
    return null;
  }

  onSubmit(): void {
    if (this.prenotazioneForm.valid && this.selectedLezione) {
      this.loading = true;
      this.clearMessages();

      const formData = this.prenotazioneForm.value;
      const request = {
        lezioneId: this.selectedLezione.lezioneId,
        note: formData.note,
        venditaId: this.selectedPacchetto ? this.selectedPacchetto.venditaId : undefined
      };

      this.prenotazioneService.creaPrenotazione(request).subscribe({
        next: (response) => {
          this.loading = false;
          this.showToastMessage('Prenotazione effettuata con successo!', 'success');
          this.prenotazioneForm.reset();
          this.selectedLezione = null;
          this.selectedTipoLezione = null;
          this.selectedPacchetto = null;
          this.lezioniDisponibili = [];
          this.tipiLezione = [];
          this.caricaPrenotazioniUtente();
        },
        error: (error) => {
          this.loading = false;
          const errorMsg = error.error?.message || 'Errore durante la prenotazione';
          this.showToastMessage(errorMsg, 'error');
        }
      });
    } else {
      this.showToastMessage('Completa tutti i campi obbligatori e seleziona una lezione', 'error');
      this.prenotazioneForm.markAllAsTouched();
    }
  }

  // Toast notification methods - Badge style
  showToastMessage(message: string, type: 'success' | 'error' | 'info' = 'success') {
    this.toastMessage = message;
    this.toastType = type;
    this.toastIcon = type === 'success' ? 'success' : type === 'error' ? 'error' : 'info';
    this.showToast = true;
    
    // Auto hide after 3 seconds
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

  clearMessages(): void {
    this.error = null;
    this.successMessage = null;
    this.hideToast();
  }

  getMinDate(): string {
    // Non permettere prenotazioni per date passate
    return new Date().toISOString().split('T')[0];
  }

  isFormValid(): boolean {
    return this.prenotazioneForm.valid && this.selectedLezione !== null;
  }

  // Metodi per gestione prenotazioni esistenti
  caricaPrenotazioniUtente(): void {
    this.prenotazioneService.getMiePrenotazioniFuture().subscribe({
      next: (prenotazioni) => {
        this.prenotazioniUtente = prenotazioni;
      },
      error: (error) => {
        console.error('Errore durante il caricamento delle prenotazioni', error);
      }
    });
  }

  apriGestionePrenotazioni(): void {
    this.caricaPrenotazioniUtente();
    this.showGestioneModal = true;
  }

  chiudiGestionePrenotazioni(): void {
    this.showGestioneModal = false;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  modificaPrenotazione(prenotazione: PrenotazioneLezioneResponse, index: number): void {
    // Implementa la logica di modifica
    this.showToastMessage(`Modifica prenotazione per ${prenotazione.titolo}`, 'info');
    
    // Qui potresti aprire un altro modal con form di modifica
    // Per ora mostriamo solo una notifica
  }

  cancellaPrenotazione(prenotazione: PrenotazioneLezioneResponse, index: number): void {
    const conferma = confirm(`Sei sicuro di voler cancellare la prenotazione per ${prenotazione.titolo} del ${this.formatDate(prenotazione.dataInizio)}?`);

    if (conferma) {
    this.prenotazioneService.cancellaPrenotazione(prenotazione.lezioneId).subscribe({
        next: () => {
          this.prenotazioniUtente.splice(index, 1);
          this.showToastMessage('Prenotazione cancellata con successo', 'success');
          if (this.selectedTipoLezione) {
            this.caricaLezioniPerTipo(); // Ricarica le lezioni disponibili
          }
        },
        error: (error) => {
          const errorMsg = error.error?.message || 'Errore durante la cancellazione';
          this.showToastMessage(errorMsg, 'error');
        }
      });
    }
  }
}