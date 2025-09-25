import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { LoggedUserComponent } from '../../../../shared/components/logged-user/logged-user.component';
import { PageTitleComponent } from '../../../../core/page-title/page-title.component';
import { NotificationComponent } from '../../../../core/notification/notification.component';
import { AuthJwtService } from '../../../../core/services/authJwt.service';
import { inject } from '@angular/core';

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

  title: string = 'Prenotazioni';
  
  prenotazioneForm: FormGroup;
  corsiFiltrati: any[] = [];
  selectedCorso: any = null;
  orariDisponibili: string[] = [];
  orariInfo: { [key: string]: { disponibile: boolean; postiRimasti: number; postiTotali: number } } = {};
  selectedDate: string = '';
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
  prenotazioniUtente: any[] = [];

  // Mock data per i corsi - verrà sostituito con chiamata API
  corsiDisponibili = [
    {
      id: 1,
      nome: 'Pilates Base',
      descrizione: 'Corso base di pilates per principianti',
      categoria: 'PILATES',
      livello: 'PRINCIPIANTE',
      durataMinuti: 60,
      maxPartecipanti: 8,
      prezzo: 25.00,
      attivo: true
    },
    {
      id: 2,
      nome: 'Matwork Avanzato',
      descrizione: 'Lezioni di matwork per livello avanzato',
      categoria: 'MATWORK',
      livello: 'AVANZATO',
      durataMinuti: 75,
      maxPartecipanti: 10,
      prezzo: 35.00,
      attivo: true
    },
    {
      id: 3,
      nome: 'Yoga Rilassante',
      descrizione: 'Sessioni di yoga per rilassamento e stretching',
      categoria: 'YOGA',
      livello: 'INTERMEDIO',
      durataMinuti: 90,
      maxPartecipanti: 12,
      prezzo: 30.00,
      attivo: true
    }
  ];

  constructor() {
    this.prenotazioneForm = this.fb.group({
      corso: ['', Validators.required],
      data: ['', Validators.required],
      orario: ['', Validators.required],
      note: ['']
    });
  }

  ngOnInit(): void {
    this.corsiFiltrati = [...this.corsiDisponibili];
    this.generateOrariDisponibili();
    this.caricaPrenotazioniUtente();
  }

  private generateOrariDisponibili(): void {
    // Genera orari disponibili dalle 8:00 alle 20:00 con intervalli di 30 minuti
    for (let i = 8; i <= 20; i++) {
      this.orariDisponibili.push(`${i.toString().padStart(2, '0')}:00`);
      if (i < 20) {
        this.orariDisponibili.push(`${i.toString().padStart(2, '0')}:30`);
      }
    }
  }

  onCorsoChange(event: any): void {
    const corsoId = parseInt(event.target.value);
    this.selectedCorso = this.corsiDisponibili.find(c => c.id === corsoId);
    this.updateOrariDisponibili();
  }

  onDateChange(event: any): void {
    this.selectedDate = event.target.value;
    this.updateOrariDisponibili();
  }

  selectOrario(orario: string): void {
    if (this.isOrarioDisponibile(orario)) {
      this.prenotazioneForm.patchValue({ orario });
    }
  }

  isOrarioDisponibile(orario: string): boolean {
    const info = this.orariInfo[orario];
    return info ? info.disponibile : true; // Default disponibile se non ci sono info
  }

  getOrarioInfo(orario: string): { disponibile: boolean; postiRimasti: number; postiTotali: number } | null {
    return this.orariInfo[orario] || null;
  }

  private updateOrariDisponibili(): void {
    if (this.selectedDate && this.selectedCorso) {
      // Mock: simula controllo disponibilità orari
      this.orariInfo = {};
      this.orariDisponibili.forEach(orario => {
        // Simula alcuni orari non disponibili
        const random = Math.random();
        const maxPosti = this.selectedCorso.maxPartecipanti;
        const postiOccupati = Math.floor(random * maxPosti);
        const postiRimasti = maxPosti - postiOccupati;
        
        this.orariInfo[orario] = {
          disponibile: postiRimasti > 0,
          postiRimasti,
          postiTotali: maxPosti
        };
      });
    }
  }

  onSubmit(): void {
    if (this.prenotazioneForm.valid) {
      this.loading = true;
      this.clearMessages();

      const formData = this.prenotazioneForm.value;
      const username = this.auth.loggedUser();

      // Mock submission - verrà sostituito con chiamata API reale
      console.log('Dati prenotazione:', {
        ...formData,
        username,
        corso: this.selectedCorso
      });

      setTimeout(() => {
        this.loading = false;
        this.showToastMessage('Prenotazione effettuata con successo!', 'success');
        this.prenotazioneForm.reset();
        this.selectedCorso = null;
        this.orariDisponibili = [];
        this.orariInfo = {};
      }, 1000);
    } else {
      this.showToastMessage('Completa tutti i campi obbligatori', 'error');
      this.prenotazioneForm.markAllAsTouched();
    }
  }

  // Toast notification methods - Badge style
  showToastMessage(message: string, type: 'success' | 'error' | 'info' = 'success') {
    this.toastMessage = message;
    this.toastType = type;
    this.toastIcon = type === 'success' ? 'check_circle' : type === 'error' ? 'error' : 'info';
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
    return this.prenotazioneForm.valid && this.selectedCorso !== null;
  }

  // Metodi per gestione prenotazioni esistenti
  caricaPrenotazioniUtente(): void {
    const username = this.auth.loggedUser();
    
    // Mock data - sarà sostituito con chiamata API reale
    this.prenotazioniUtente = [
      {
        id: 1,
        corsoId: 1,
        corsoNome: 'Pilates Base',
        categoria: 'PILATES',
        data: '2025-09-26',
        orario: '09:00',
        note: 'Prima lezione',
        stato: 'CONFERMATA'
      },
      {
        id: 2,
        corsoId: 2,
        corsoNome: 'Matwork Avanzato', 
        categoria: 'MATWORK',
        data: '2025-09-28',
        orario: '10:30',
        note: '',
        stato: 'CONFERMATA'
      },
      {
        id: 3,
        corsoId: 3,
        corsoNome: 'Yoga Rilassante',
        categoria: 'YOGA', 
        data: '2025-09-30',
        orario: '18:00',
        note: 'Lezione serale',
        stato: 'CONFERMATA'
      }
    ];
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

  modificaPrenotazione(prenotazione: any, index: number): void {
    // Implementa la logica di modifica
    this.showToastMessage(`Modifica prenotazione per ${prenotazione.corsoNome}`, 'info');
    
    // Qui potresti aprire un altro modal con form di modifica
    // Per ora mostriamo solo una notifica
  }

  cancellaPrenotazione(prenotazione: any, index: number): void {
    const conferma = confirm(`Sei sicuro di voler cancellare la prenotazione per ${prenotazione.corsoNome} del ${this.formatDate(prenotazione.data)}?`);
    
    if (conferma) {
      // Simula cancellazione
      this.prenotazioniUtente.splice(index, 1);
      this.showToastMessage('Prenotazione cancellata con successo', 'success');
    }
  }
}