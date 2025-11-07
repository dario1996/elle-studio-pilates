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
      // 'lezione' non è più obbligatorio per permettere richieste su slot generati dal template
      lezione: [''],
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
      error: (error: any) => {
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
      // if pacchetto is COMBO, use allowedTypes provided by backend; otherwise load by categoria
      if (this.selectedPacchetto.isCombo) {
        // map allowedTypes to TipoLezione shape expected by component
        this.tipiLezione = (this.selectedPacchetto.allowedTypes || []).map(at => ({
          id: at.templateId || 0,
          giornoSettimana: '',
          oraInizio: '',
          oraFine: '',
          titolo: at.titolo || at.tipoLezione,
          tipoLezione: at.tipoLezione,
          istruttore: '',
          maxPartecipanti: at.maxPartecipanti || 1,
          attivo: true
        } as any));
      } else {
        this.caricaTipiLezionePerPacchetto();
      }
    }
  }

  caricaTipiLezionePerPacchetto(): void {
    if (!this.selectedPacchetto) return;
    
    this.loading = true;
    // passiamo la categoria del pacchetto al backend
    this.prenotazioneService.getTipiLezionePerPacchetto(this.selectedPacchetto.categoria).subscribe({
      next: (tipi) => {
        this.tipiLezione = tipi;
        this.loading = false;
        // If the pacchetto is NOT a combo, auto-select the first available tipo
        // so the user doesn't have to choose (and we hide the select in the template).
        if (!this.selectedPacchetto?.isCombo && this.tipiLezione.length > 0) {
          this.selectedTipoLezione = this.tipiLezione[0];
          // update form control so Validators.required (if present) is satisfied
          this.prenotazioneForm.patchValue({ tipoLezione: String(this.selectedTipoLezione.id) });
          // load lezioni for the auto-selected tipo
          this.caricaLezioniPerTipo();
        }
      },
      error: (error: any) => {
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
    
    this.prenotazioneService.getLezioniPerTipo(this.selectedTipoLezione.tipoLezione, 4).subscribe({
      next: (lezioni: any) => {
        // Normalize backend SlotDTO -> LezioneDisponibile expected shape
        this.lezioniDisponibili = (lezioni || []).map((s: any) => ({
          lezioneId: s.lezioneId || null,
          titolo: s.titolo,
          dataInizio: s.dataInizio,
          dataFine: s.dataFine,
          istruttore: s.istruttore || this.selectedTipoLezione?.istruttore || '',
          tipoLezione: this.selectedTipoLezione?.tipoLezione || '',
          maxPartecipanti: s.maxPartecipanti || this.selectedTipoLezione?.maxPartecipanti || 0,
          postiOccupati: s.prenotati || 0,
          postiDisponibili: s.postiDisponibili != null ? s.postiDisponibili : (s.maxPartecipanti || this.selectedTipoLezione?.maxPartecipanti || 0),
          // disponibile se postiDisponibili > 0 (sia per lezioni materializzate che generate dal template)
          disponibile: (s.postiDisponibili == null) ? true : (s.postiDisponibili > 0),
          giornoSettimana: this.selectedTipoLezione?.giornoSettimana || '',
          templateId: s.templateId || this.selectedTipoLezione?.id
        } as LezioneDisponibile));
        this.loading = false;
      },
      error: (error: any) => {
        console.error('Errore durante il caricamento delle lezioni', error);
        this.showToastMessage('Errore durante il caricamento delle lezioni', 'error');
        this.loading = false;
      }
    });
  }

  onLezioneChange(event: any): void {
    // support both select change event ({ target: { value } }) and direct numeric id
    let lezioneId: number | null = null;
    if (typeof event === 'number') lezioneId = event;
    else if (event && event.target && event.target.value != null) lezioneId = parseInt(event.target.value);

    if (lezioneId == null || isNaN(lezioneId)) {
      this.selectedLezione = null;
      this.prenotazioneForm.patchValue({ lezione: '' });
      return;
    }

    this.selectedLezione = this.lezioniDisponibili.find(l => l.lezioneId === lezioneId) || null;
    // ensure the form control is in sync so Validators.required passes
    this.prenotazioneForm.patchValue({ lezione: String(lezioneId) });
  }

  /**
   * Seleziona uno slot (lezione) cliccato nella UI. Accetta sia lezioni materializzate
   * (con lezioneId) che generate dal template (lezioneId null). Se la lezione non è
   * materializzata il form viene aggiornato ma il submit mostrerà un messaggio che
   * la prenotazione è possibile solo su lezioni materializzate.
   */
  selectLezione(lezione: LezioneDisponibile): void {
    this.selectedLezione = lezione;
    // sincronizza il form control con l'id se presente, altrimenti svuota
    if (lezione.lezioneId != null) {
      this.prenotazioneForm.patchValue({ lezione: String(lezione.lezioneId) });
    } else {
      this.prenotazioneForm.patchValue({ lezione: '' });
    }
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

      // If selectedLezione has a materialized lezioneId, use existing creaPrenotazione flow
      if (this.selectedLezione.lezioneId != null) {
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
          error: (error: any) => {
            this.loading = false;
            const errorMsg = error.error?.message || 'Errore durante la prenotazione';
            this.showToastMessage(errorMsg, 'error');
          }
        });
      } else {
        // Slot generato: request the backend to book by tipoLezione (backend resolves a materialized lezione)
        const payload: any = { tipoLezione: this.selectedTipoLezione?.tipoLezione || null };
        if (this.selectedPacchetto) payload.venditaId = this.selectedPacchetto.venditaId;
        if (formData.note) payload.note = formData.note;

        this.prenotazioneService.creaPrenotazioneUtente(payload).subscribe({
          next: (resp: any) => {
            this.loading = false;
            // backend returns 201 Created on success
            const status = resp?.status || (resp?.body ? 200 : 0);
            if (status === 201) {
              this.showToastMessage('Prenotazione effettuata con successo!', 'success');
            } else {
              // fallback success message
              this.showToastMessage('Prenotazione effettuata', 'success');
            }
            this.prenotazioneForm.reset();
            this.selectedLezione = null;
            this.selectedTipoLezione = null;
            this.selectedPacchetto = null;
            this.lezioniDisponibili = [];
            this.tipiLezione = [];
            this.caricaPrenotazioniUtente();
          },
          error: (error: any) => {
            this.loading = false;
            // map backend status codes to friendly messages
            if (error?.status === 404) {
              this.showToastMessage('Nessuna lezione materializzata trovata per questo tipo', 'error');
            } else if (error?.status === 409) {
              this.showToastMessage('Impossibile prenotare: la lezione è piena', 'error');
            } else {
              const errorMsg = error.error?.message || 'Errore durante la prenotazione';
              this.showToastMessage(errorMsg, 'error');
            }
          }
        });
      }

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
      error: (error: any) => {
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
        error: (error: any) => {
            const errorMsg = error.error?.message || 'Errore durante la cancellazione';
            this.showToastMessage(errorMsg, 'error');
          }
      });
    }
  }
}