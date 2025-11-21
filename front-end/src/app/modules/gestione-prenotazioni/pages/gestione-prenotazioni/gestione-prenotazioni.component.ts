import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { LoggedUserComponent } from '../../../../shared/components/logged-user/logged-user.component';
import { PageTitleComponent } from '../../../../core/page-title/page-title.component';
import { NotificationComponent } from '../../../../core/notification/notification.component';
import { AuthJwtService } from '../../../../core/services/authJwt.service';
import { inject } from '@angular/core';
import { PrenotazioneService } from '../../../../shared/services/prenotazione.service';
import { 
  LezioneDisponibile, 
  PrenotazioneLezioneResponse, 
  TipoLezione, 
  Pacchetto,
  PrenotazioneRicorrenteRequest,
  PrenotazioneLezione
} from '../../../../shared/models/prenotazione.model';

@Component({
  selector: 'app-gestione-prenotazioni',
  templateUrl: './gestione-prenotazioni.component.html',
  styleUrls: ['./gestione-prenotazioni.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, PageTitleComponent, LoggedUserComponent],
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
  
  // Accordion per orari raggruppati per giorno
  templatesPerGiorno: Map<string, TipoLezione[]> = new Map();
  giorniConOrari: string[] = [];
  accordionAperto: string | null = null;
  selectedTemplate: TipoLezione | null = null;
  categoriaLezioneSelezionata: string | null = null;
  
  // Toast notification properties
  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'error' | 'info' = 'success';
  toastIcon = '';
  private toastTimeout?: number;

  // Modal gestione prenotazioni
  showGestioneModal = false;
  prenotazioniUtente: PrenotazioneLezione[] = [];
  prenotazioniFiltrate: PrenotazioneLezione[] = [];
  filtroStato: string = 'TUTTE';
  filtroOrdinamento: string = 'DATA_ASC';

  // Prenotazioni ricorrenti
  previewDate: string[] = []; // Array delle date che verranno prenotate
  showPreviewModal = false;
  confermaInCorso = false;

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
    
    console.log('Pacchetto selezionato:', this.selectedPacchetto);
    console.log('Categoria:', this.selectedPacchetto?.categoria);
    console.log('CategorieLezioni:', this.selectedPacchetto?.categorieLezioni);
    console.log('Is COMBO:', this.isPackettoCombo());
    console.log('Categorie parsed:', this.getCategorieLezioniCombo());
    
    // Reset selezioni successive
    this.selectedTipoLezione = null;
    this.selectedLezione = null;
    this.selectedTemplate = null;
    this.categoriaLezioneSelezionata = null;
    this.lezioniDisponibili = [];
    this.tipiLezione = [];
    this.templatesPerGiorno = new Map();
    this.giorniConOrari = [];
    this.accordionAperto = null;
    this.prenotazioneForm.patchValue({
      tipoLezione: '',
      lezione: ''
    });
    
    if (this.selectedPacchetto) {
      this.caricaTemplatesPerCategoria();
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

  caricaTemplatesPerCategoria(): void {
    if (!this.selectedPacchetto) return;
    
    // Se è un COMBO, non caricare nulla finché non viene selezionato il tipo lezione
    if (this.isPackettoCombo()) {
      console.log('Pacchetto COMBO selezionato, attendere selezione tipo lezione');
      return;
    }
    
    this.loading = true;
    // Usa la categoria del pacchetto per filtrare i template
    this.prenotazioneService.getTemplatesPerTipoLezione(this.selectedPacchetto.categoria).subscribe({
      next: (templates) => {
        console.log('Templates ricevuti per categoria', this.selectedPacchetto!.categoria, templates);
        this.raggruppaPergiornoSettimana(templates);
        this.loading = false;
      },
      error: (error) => {
        console.error('Errore durante il caricamento dei template', error);
        this.showToastMessage('Errore durante il caricamento degli orari disponibili', 'error');
        this.loading = false;
      }
    });
  }

  onTipoLezioneComboChange(event: any): void {
    const categoriaSelezionata = event.target.value;
    if (!categoriaSelezionata) return;
    
    this.loading = true;
    this.templatesPerGiorno = new Map();
    this.giorniConOrari = [];
    this.accordionAperto = null;
    this.selectedTemplate = null;
    
    this.prenotazioneService.getTemplatesPerTipoLezione(categoriaSelezionata).subscribe({
      next: (templates) => {
        console.log('Templates ricevuti per tipo lezione COMBO', categoriaSelezionata, templates);
        this.raggruppaPergiornoSettimana(templates);
        this.loading = false;
      },
      error: (error) => {
        console.error('Errore durante il caricamento dei template', error);
        this.showToastMessage('Errore durante il caricamento degli orari disponibili', 'error');
        this.loading = false;
      }
    });
  }

  raggruppaPergiornoSettimana(templates: TipoLezione[]): void {
    this.templatesPerGiorno = new Map();
    this.giorniConOrari = [];
    
    const giorniOrdinati = ['LUNEDI', 'MARTEDI', 'MERCOLEDI', 'GIOVEDI', 'VENERDI', 'SABATO', 'DOMENICA'];
    
    templates.forEach(template => {
      const giorno = template.giornoSettimana;
      if (!this.templatesPerGiorno.has(giorno)) {
        this.templatesPerGiorno.set(giorno, []);
      }
      this.templatesPerGiorno.get(giorno)!.push(template);
    });
    
    // Ordina i giorni
    this.giorniConOrari = giorniOrdinati.filter(g => this.templatesPerGiorno.has(g));
    
    console.log('Templates raggruppati per giorno:', this.templatesPerGiorno);
    console.log('Giorni con orari:', this.giorniConOrari);
  }

  toggleAccordion(giorno: string): void {
    this.accordionAperto = this.accordionAperto === giorno ? null : giorno;
  }

  isAccordionAperto(giorno: string): boolean {
    return this.accordionAperto === giorno;
  }

  getTemplatesPerGiorno(giorno: string): TipoLezione[] {
    return this.templatesPerGiorno.get(giorno) || [];
  }

  selezionaTemplate(template: TipoLezione): void {
    this.selectedTemplate = template;
    console.log('Template selezionato:', template);
    
    // Genera preview delle date
    if (this.selectedPacchetto?.lezioniRimanenti) {
      this.generaPreviewDate(template.giornoSettimana, this.selectedPacchetto.lezioniRimanenti);
    }
  }

  isPackettoCombo(): boolean {
    return this.selectedPacchetto?.categoria === 'COMBO';
  }

  getCategorieLezioniCombo(): string[] {
    if (!this.selectedPacchetto?.categorieLezioni) return [];
    try {
      // Se categorieLezioni è già un array, ritornalo
      if (Array.isArray(this.selectedPacchetto.categorieLezioni)) {
        return this.selectedPacchetto.categorieLezioni;
      }
      // Altrimenti prova a parsarlo come JSON string
      return JSON.parse(this.selectedPacchetto.categorieLezioni as any);
    } catch {
      return [];
    }
  }

  formatTipoLezione(tipo: string): string {
    const mappings: {[key: string]: string} = {
      'PRIVATA': 'Privata',
      'PRIMA_LEZIONE': 'Prima Lezione',
      'SEMI_PRIVATA': 'Semi Privata',
      'PILATES_MATWORK': 'Pilates Matwork',
      'YOGA': 'Yoga',
      'STUDIO_INTERMEDIO': 'Studio Intermedio',
      'REFORMER_INTERMEDIO': 'Reformer Intermedio',
      'STUDIO_POSTURALE': 'Studio Posturale'
    };
    return mappings[tipo] || tipo;
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
        note: formData.note
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
    this.prenotazioneService.getMiePrenotazioniRicorrenti().subscribe({
      next: (prenotazioni) => {
        this.prenotazioniUtente = prenotazioni;
        this.applicaFiltri();
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

  applicaFiltri(): void {
    let risultato = [...this.prenotazioniUtente];

    // Filtro per stato
    if (this.filtroStato !== 'TUTTE') {
      risultato = risultato.filter(p => p.stato === this.filtroStato);
    }

    // Ordinamento
    if (this.filtroOrdinamento === 'DATA_ASC') {
      risultato.sort((a, b) => new Date(a.dataLezione).getTime() - new Date(b.dataLezione).getTime());
    } else if (this.filtroOrdinamento === 'DATA_DESC') {
      risultato.sort((a, b) => new Date(b.dataLezione).getTime() - new Date(a.dataLezione).getTime());
    }

    this.prenotazioniFiltrate = risultato;
  }

  onFiltroStatoChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.filtroStato = select.value;
    this.applicaFiltri();
  }

  onFiltroOrdinamentoChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.filtroOrdinamento = select.value;
    this.applicaFiltri();
  }

  formatDatePrenotazione(dataStr: string): string {
    const data = new Date(dataStr);
    const dd = data.getDate().toString().padStart(2, '0');
    const mm = (data.getMonth() + 1).toString().padStart(2, '0');
    const yyyy = data.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  formatTime(timeStr: string): string {
    if (!timeStr) return '';
    const [hours, minutes] = timeStr.split(':');
    return `${hours}:${minutes}`;
  }

  getStatoBadgeClass(stato: string): string {
    switch (stato) {
      case 'CONFERMATA':
        return 'badge-confermata';
      case 'CANCELLATA':
        return 'badge-cancellata';
      case 'IN_ATTESA':
        return 'badge-attesa';
      default:
        return 'badge-default';
    }
  }

  getStatoLabel(stato: string): string {
    switch (stato) {
      case 'CONFERMATA':
        return 'Confermata';
      case 'CANCELLATA':
        return 'Cancellata';
      case 'IN_ATTESA':
        return 'In Attesa';
      default:
        return stato;
    }
  }

  puoCancellare(prenotazione: PrenotazioneLezione): boolean {
    if (prenotazione.stato !== 'CONFERMATA') {
      return false;
    }

    const dataLezione = new Date(prenotazione.dataLezione);
    const oggi = new Date();
    oggi.setHours(0, 0, 0, 0);
    
    return dataLezione >= oggi;
  }

  modificaPrenotazione(prenotazione: PrenotazioneLezione, index: number): void {
    // Implementa la logica di modifica
    this.showToastMessage(`Modifica prenotazione per ${prenotazione.titolo}`, 'info');
    
    // Qui potresti aprire un altro modal con form di modifica
    // Per ora mostriamo solo una notifica
  }

  cancellaPrenotazione(prenotazione: PrenotazioneLezione): void {
    const conferma = confirm(`Sei sicuro di voler cancellare la prenotazione per "${prenotazione.titolo}" del ${this.formatDatePrenotazione(prenotazione.dataLezione)}?`);

    if (conferma) {
      this.prenotazioneService.cancellaPrenotazioneRicorrente(prenotazione.id).subscribe({
        next: (response) => {
          this.showToastMessage('Prenotazione cancellata con successo', 'success');
          this.caricaPrenotazioniUtente();
          this.caricaPacchetti();
        },
        error: (error) => {
          const errorMsg = error.error?.messaggio || 'Errore durante la cancellazione';
          this.showToastMessage(errorMsg, 'error');
        }
      });
    }
  }

  // ============================================
  // METODI PER PRENOTAZIONI RICORRENTI
  // ============================================

  /**
   * Genera array delle date per le prossime N settimane
   * Replica la logica del backend: trova il prossimo giorno richiesto (es. lunedì)
   * senza aggiungere 7 giorni fissi
   */
  generaPreviewDate(giornoSettimana: string, numeroLezioni: number): void {
    const giorniMap: {[key: string]: number} = {
      'LUNEDI': 1, 'MARTEDI': 2, 'MERCOLEDI': 3, 'GIOVEDI': 4,
      'VENERDI': 5, 'SABATO': 6, 'DOMENICA': 0
    };
    
    const targetDay = giorniMap[giornoSettimana.toUpperCase()];
    const oggi = new Date();
    
    // Trova la prima occorrenza del giorno richiesto partendo da oggi
    let primaData = new Date(oggi);
    
    // Cerca il prossimo giorno target
    while (primaData.getDay() !== targetDay) {
      primaData.setDate(primaData.getDate() + 1);
    }
    
    // Se la prima occorrenza è oggi, passa alla settimana successiva
    // (non si può prenotare lo stesso giorno)
    if (primaData.toDateString() === oggi.toDateString()) {
      primaData.setDate(primaData.getDate() + 7);
    }
    
    // Genera N date settimanali
    this.previewDate = [];
    for (let i = 0; i < numeroLezioni; i++) {
      const data = new Date(primaData);
      data.setDate(data.getDate() + (i * 7));
      this.previewDate.push(data.toISOString().split('T')[0]);
    }
    
    console.log('Preview date generate:', this.previewDate);
  }

  /**
   * Mostra modal di conferma con anteprima
   */
  mostraPreviewPrenotazione(): void {
    if (!this.selectedTemplate || !this.selectedPacchetto) {
      this.showToastMessage('Seleziona un orario per continuare', 'error');
      return;
    }
    
    if (!this.selectedPacchetto.lezioniRimanenti || this.selectedPacchetto.lezioniRimanenti === 0) {
      this.showToastMessage('Non hai lezioni disponibili in questo pacchetto', 'error');
      return;
    }
    
    this.showPreviewModal = true;
  }

  /**
   * Chiude modal preview
   */
  chiudiPreviewModal(): void {
    this.showPreviewModal = false;
  }

  /**
   * Conferma e invia prenotazione ricorrente
   */
  confermaPrenotazioneRicorrente(): void {
    if (!this.selectedPacchetto || !this.selectedTemplate) return;
    
    this.confermaInCorso = true;
    
    const request: PrenotazioneRicorrenteRequest = {
      venditaId: this.selectedPacchetto.id,
      templateId: this.selectedTemplate.id,
      tipoLezione: this.categoriaLezioneSelezionata || undefined,
      numeroLezioni: this.selectedPacchetto.lezioniRimanenti
    };
    
    this.prenotazioneService.prenotaRicorrente(request).subscribe({
      next: (response) => {
        this.confermaInCorso = false;
        this.showPreviewModal = false;
        this.showToastMessage(
          `${response.numeroPrenotazioni} lezioni prenotate con successo!`,
          'success'
        );
        
        // Reset selezioni e ricarica pacchetti
        this.selectedTemplate = null;
        this.selectedPacchetto = null;
        this.previewDate = [];
        this.caricaPacchetti();
      },
      error: (error) => {
        this.confermaInCorso = false;
        const errorMsg = error.error?.message || 'Errore durante la prenotazione';
        this.showToastMessage(errorMsg, 'error');
      }
    });
  }

  /**
   * Formatta data in italiano
   */
  formatDataItaliana(dataString: string): string {
    const data = new Date(dataString + 'T00:00:00');
    return data.toLocaleDateString('it-IT', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }
}