import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ModaleService } from '../../../../core/services/modal.service';
import { ToastrService } from 'ngx-toastr';
import { CalendarioService, CalendarioTemplate } from '../../../../shared/services/calendario.service';
import { PrenotazioneService } from '../../../../shared/services/prenotazione.service';
import { UserService } from '../../../../core/services/data/user.service';
import { IUtenteAutocomplete } from '../../../../shared/models/utente-autocomplete.model';
import { debounceTime, distinctUntilChanged, switchMap, of, forkJoin } from 'rxjs';

interface SlotDisponibile {
  templateId: number;
  giornoSettimana: string;
  giornoSettimanaNome: string;
  oraInizio: string;
  oraFine: string;
  titolo: string;
  istruttore: string;
  maxPartecipanti: number;
  postiOccupati: number;
  postiDisponibili: number;
  disponibile: boolean;
  utenteAssegnato?: string; // Nome utente che ha prenotato (se postiOccupati = maxPartecipanti)
}

@Component({
  selector: 'app-form-prenotazione-posturale',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-prenotazione-posturale.component.html',
  styleUrls: ['./form-prenotazione-posturale.component.css']
})
export class FormPrenotazionePosturaleComponent implements OnInit {
  private fb = inject(FormBuilder);
  private modaleService = inject(ModaleService);
  private toastr = inject(ToastrService);
  private calendarioService = inject(CalendarioService);
  private prenotazioneService = inject(PrenotazioneService);
  private userService = inject(UserService);
  private cdr = inject(ChangeDetectorRef);

  form!: FormGroup;
  isLoading = false;
  
  // ID del pacchetto "Prima Lezione" - fisso
  readonly PACCHETTO_PRIMA_LEZIONE_ID = 1;
  readonly TIPO_LEZIONE_POSTURALE = 'Studio Posturale';
  
  // Slot disponibili raggruppati per giorno
  slotsDisponibili: SlotDisponibile[] = [];
  slotsPerGiorno: { [giorno: string]: SlotDisponibile[] } = {};
  giorniDisponibili: string[] = [];
  
  // Prenotazioni esistenti (per calcolare disponibilità)
  prenotazioniEsistenti: any[] = [];
  
  // Gestione utente
  autocompleteSearch = new FormControl('');
  utentiSuggestions: IUtenteAutocomplete[] = [];
  utenteSelezionato: IUtenteAutocomplete | null = null;
  showAutocomplete = false;

  // Mapping giorni settimana
  giorniMap: { [key: string]: string } = {
    'LUNEDI': 'Lunedì',
    'MARTEDI': 'Martedì',
    'MERCOLEDI': 'Mercoledì',
    'GIOVEDI': 'Giovedì',
    'VENERDI': 'Venerdì',
    'SABATO': 'Sabato',
    'DOMENICA': 'Domenica'
  };

  ngOnInit() {
    this.initForm();
    this.setupAutocomplete();
    this.loadSlotsDisponibili();
    
    // Subscribe to form status changes
    this.form.statusChanges?.subscribe(() => {
      this.cdr.detectChanges();
    });
  }

  private initForm() {
    this.form = this.fb.group({
      utente: ['', Validators.required],
      giornoSettimana: ['', Validators.required],
      slotId: ['', Validators.required],
      dataPrenotazione: ['', Validators.required],
      note: ['']
    });

    // Quando cambia il giorno, resetta lo slot selezionato
    this.form.get('giornoSettimana')?.valueChanges.subscribe(() => {
      this.form.patchValue({ slotId: '' }, { emitEvent: false });
    });

    // Quando cambia la data, aggiorna il giorno della settimana
    this.form.get('dataPrenotazione')?.valueChanges.subscribe((data) => {
      if (data) {
        const giornoSettimana = this.getGiornoSettimanaFromData(data);
        if (giornoSettimana) {
          this.form.patchValue({ giornoSettimana }, { emitEvent: false });
          // Ricalcola disponibilità per la data selezionata
          this.ricalcolaDisponibilitaPerData(data);
        }
      }
    });
  }

  private setupAutocomplete() {
    this.autocompleteSearch.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(term => {
        if (!term || term.length < 2) {
          return of([]);
        }
        return this.userService.getUtentiAutocomplete(term);
      })
    ).subscribe({
      next: (utenti) => {
        this.utentiSuggestions = utenti.map(u => ({
          username: u.username,
          nome: u.nome,
          cognome: u.cognome,
          email: u.email,
          nominativo: u.nome && u.cognome ? `${u.nome} ${u.cognome}` : u.username,
          displayText: u.nome && u.cognome ? `${u.nome} ${u.cognome} (${u.username})` : u.username
        }));
        this.showAutocomplete = this.utentiSuggestions.length > 0;
      },
      error: (error) => {
        console.error('Errore autocomplete utenti:', error);
        this.utentiSuggestions = [];
        this.showAutocomplete = false;
      }
    });
  }

  private loadSlotsDisponibili() {
    this.isLoading = true;
    
    forkJoin({
      templates: this.calendarioService.getCalendarioAttivo(),
      prenotazioni: this.prenotazioneService.getTuttePrenotazioni()
    }).subscribe({
      next: ({ templates, prenotazioni }) => {
        // Salva le prenotazioni per calcoli successivi
        this.prenotazioniEsistenti = prenotazioni;
        
        // Filtra solo gli slot "Studio Posturale"
        const slotsPosturali = templates.filter(
          t => t.titolo === this.TIPO_LEZIONE_POSTURALE && t.attivo
        );

        // Per ogni slot, calcola disponibilità
        this.slotsDisponibili = slotsPosturali.map(template => {
          const maxPartecipanti = template.maxPartecipanti || 1;
          
          // Conta prenotazioni per questo template (indipendentemente dalla data)
          // Nota: per una logica più precisa, dovresti contare per data specifica
          const postiOccupati = 0; // Sarà calcolato dinamicamente quando si sceglie la data
          
          const slot: SlotDisponibile = {
            templateId: template.id,
            giornoSettimana: template.giornoSettimana,
            giornoSettimanaNome: this.giorniMap[template.giornoSettimana] || template.giornoSettimana,
            oraInizio: template.oraInizio.substring(0, 5), // HH:mm
            oraFine: template.oraFine.substring(0, 5),
            titolo: template.titolo,
            istruttore: template.istruttore || 'Laura Caratti',
            maxPartecipanti,
            postiOccupati,
            postiDisponibili: maxPartecipanti - postiOccupati,
            disponibile: true // Verrà ricalcolato per data specifica
          };
          
          return slot;
        });

        // Raggruppa per giorno della settimana
        this.slotsPerGiorno = {};
        this.slotsDisponibili.forEach(slot => {
          if (!this.slotsPerGiorno[slot.giornoSettimana]) {
            this.slotsPerGiorno[slot.giornoSettimana] = [];
          }
          this.slotsPerGiorno[slot.giornoSettimana].push(slot);
        });

        // Ordina i giorni
        this.giorniDisponibili = Object.keys(this.slotsPerGiorno).sort((a, b) => {
          const ordine = ['LUNEDI', 'MARTEDI', 'MERCOLEDI', 'GIOVEDI', 'VENERDI', 'SABATO', 'DOMENICA'];
          return ordine.indexOf(a) - ordine.indexOf(b);
        });

        this.isLoading = false;
        console.log('✅ Slot posturali caricati:', this.slotsDisponibili);
      },
      error: (error) => {
        console.error('❌ Errore caricamento slot:', error);
        this.toastr.error('Errore nel caricamento degli slot disponibili');
        this.isLoading = false;
      }
    });
  }

  selezionaUtente(utente: IUtenteAutocomplete) {
    this.utenteSelezionato = utente;
    this.form.patchValue({ utente: utente.username });
    this.autocompleteSearch.setValue(utente.displayText || '');
    this.showAutocomplete = false;
  }

  rimuoviUtente() {
    this.utenteSelezionato = null;
    this.form.patchValue({ utente: '' });
    this.autocompleteSearch.setValue('');
  }

  getSlotsPerGiornoSelezionato(): SlotDisponibile[] {
    const giornoSelezionato = this.form.get('giornoSettimana')?.value;
    return this.slotsPerGiorno[giornoSelezionato] || [];
  }

  // Ricalcola disponibilità degli slot per una data specifica
  private ricalcolaDisponibilitaPerData(dataStr: string) {
    if (!dataStr) return;

    // Per ogni slot disponibile, calcola i posti occupati per quella data
    this.slotsDisponibili.forEach(slot => {
      // Conta prenotazioni confermate per questo template in questa data
      const prenotazioniSlot = this.prenotazioniEsistenti.filter(p => 
        p.templateId === slot.templateId && 
        p.dataLezione === dataStr &&
        p.stato === 'CONFERMATA'
      );

      slot.postiOccupati = prenotazioniSlot.length;
      slot.postiDisponibili = slot.maxPartecipanti - slot.postiOccupati;
      slot.disponibile = slot.postiDisponibili > 0;
      
      // Se è pieno, memorizza il nome completo dell'utente assegnato dalla prenotazione
      if (!slot.disponibile && prenotazioniSlot.length > 0) {
        // Usa il nome dell'utente dalla prenotazione (che dovrebbe essere nome + cognome)
        const prenotazione = prenotazioniSlot[0];
        slot.utenteAssegnato = prenotazione.utenteNome || prenotazione.username || 'Utente sconosciuto';
      } else {
        slot.utenteAssegnato = undefined;
      }
    });

    // Aggiorna i gruppi per giorno
    this.slotsPerGiorno = {};
    this.slotsDisponibili.forEach(slot => {
      if (!this.slotsPerGiorno[slot.giornoSettimana]) {
        this.slotsPerGiorno[slot.giornoSettimana] = [];
      }
      this.slotsPerGiorno[slot.giornoSettimana].push(slot);
    });

    this.cdr.detectChanges();
    console.log('🔄 Disponibilità ricalcolata per data:', dataStr);
  }

  onSubmit(): any {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastr.warning('Compila tutti i campi obbligatori');
      return null;
    }

    const formValue = this.form.value;
    const slotSelezionato = this.slotsDisponibili.find(s => s.templateId === +formValue.slotId);
    
    if (!slotSelezionato) {
      this.toastr.error('Slot non trovato');
      return null;
    }

    // Verifica se lo slot è disponibile
    if (!slotSelezionato.disponibile) {
      const nomeOccupante = slotSelezionato.utenteAssegnato || 'un altro utente';
      this.toastr.warning(
        `Impossibile prenotare: lo slot del ${this.giorniMap[slotSelezionato.giornoSettimana]} alle ${slotSelezionato.oraInizio} è già occupato da ${nomeOccupante}`,
        'Slot non disponibile',
        { timeOut: 6000 }
      );
      return null;
    }

    // Costruisci l'oggetto prenotazione con struttura compatibile per backend
    const prenotazione = {
      pacchettoId: this.PACCHETTO_PRIMA_LEZIONE_ID,
      templateId: slotSelezionato.templateId,
      dataLezione: formValue.dataPrenotazione,
      username: formValue.utente,
      tipoLezione: slotSelezionato.titolo,
      oraInizio: slotSelezionato.oraInizio,
      oraFine: slotSelezionato.oraFine,
      note: formValue.note || `Prima lezione posturale - Pacchetto ID ${this.PACCHETTO_PRIMA_LEZIONE_ID}`,
      numeroLezioni: 1 // Prima lezione = 1 sola lezione
    };

    console.log('📝 Prenotazione da creare:', prenotazione);
    
    // Chiama il callback onConferma dal modal service
    this.modaleService.config$.subscribe(config => {
      if (config?.onConferma) {
        config.onConferma(prenotazione);
      }
    }).unsubscribe();
    
    return prenotazione;
  }

  // Ricava il giorno della settimana da una data
  private getGiornoSettimanaFromData(dataStr: string): string | null {
    const data = new Date(dataStr);
    const giorniMap: string[] = ['DOMENICA', 'LUNEDI', 'MARTEDI', 'MERCOLEDI', 'GIOVEDI', 'VENERDI', 'SABATO'];
    const giornoIndex = data.getDay();
    return giorniMap[giornoIndex];
  }

  // Calcola la prossima data disponibile per un giorno della settimana
  getProxGiornoSettimana(giornoSettimana: string): string {
    const oggi = new Date();
    const giorniMap: { [key: string]: number } = {
      'DOMENICA': 0,
      'LUNEDI': 1,
      'MARTEDI': 2,
      'MERCOLEDI': 3,
      'GIOVEDI': 4,
      'VENERDI': 5,
      'SABATO': 6
    };
    
    const targetDay = giorniMap[giornoSettimana];
    const currentDay = oggi.getDay();
    
    let daysToAdd = targetDay - currentDay;
    if (daysToAdd <= 0) {
      daysToAdd += 7; // Prossima settimana
    }
    
    const proxData = new Date(oggi);
    proxData.setDate(oggi.getDate() + daysToAdd);
    
    return proxData.toISOString().split('T')[0];
  }

  // Imposta automaticamente la data quando si seleziona il giorno
  onGiornoChange(giorno: string) {
    if (!giorno) {
      return;
    }
    const proxData = this.getProxGiornoSettimana(giorno);
    this.form.patchValue({ dataPrenotazione: proxData });
  }
}
