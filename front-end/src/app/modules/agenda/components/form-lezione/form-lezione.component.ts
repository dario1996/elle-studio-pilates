import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormArray, FormControl } from '@angular/forms';
import { ModaleService } from '../../../../core/services/modal.service';
import { ToastrService } from 'ngx-toastr';
import { LezioniService } from '../../../../core/services/lezioni.service';
import { PacchettiService } from '../../../../core/services/data/pacchetti.service';
import { UserService } from '../../../../core/services/data/user.service';
import { ILezione, TipoLezione, StatoLezione } from '../../../../shared/models/Lezione';
import { IPacchetti } from '../../../../shared/models/Pacchetti';
import { IUtenteAutocomplete } from '../../../../shared/models/utente-autocomplete.model';
import { debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';

@Component({
  selector: 'app-form-lezione',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-lezione.component.html',
  styleUrls: ['./form-lezione.component.css']
})
export class FormLezioneComponent implements OnInit {
  private fb = inject(FormBuilder);
  private modaleService = inject(ModaleService);
  private toastr = inject(ToastrService);
  private lezioniService = inject(LezioniService);
  private pacchettiService = inject(PacchettiService);
  private userService = inject(UserService);
  private cdr = inject(ChangeDetectorRef);

  form!: FormGroup;
  lezioneToEdit?: ILezione;  // Questa è la proprietà che riceverà i dati dal modal
  isEditMode = false;
  isLoading = false;

  // Sostituiamo i mock con i pacchetti reali
  pacchettiDisponibili: IPacchetti[] = [];
  
  // Istruttore fisso: Laura Caratti
  readonly ISTRUTTORE_FISSO = 'Laura Caratti';

  // Gestione partecipanti
  autocompleteSearch = new FormControl('');
  utentiSuggestions: IUtenteAutocomplete[] = [];
  partecipantiSelezionati: IUtenteAutocomplete[] = [];
  showAutocomplete = false;
  maxPartecipantiCorrente = 0;

  // Mapping categoria pacchetto -> tipo lezione
  private mapCategoriaToTipoLezione(categoria: string): TipoLezione {
    switch (categoria.toUpperCase()) {
      case 'PRIMA_LEZIONE':
        return TipoLezione.PRIMA_LEZIONE;
      case 'PRIVATA':
        return TipoLezione.PRIVATA;
      case 'SEMI_PRIVATA':
        return TipoLezione.SEMI_PRIVATA_DUETTO; // Default per semi-privata
      case 'GRUPPO_MAT':
      case 'MATWORK':
        return TipoLezione.MATWORK;
      case 'COMBO':
        return TipoLezione.SEMI_PRIVATA_GRUPPO; // Mappiamo COMBO a gruppo
      case 'YOGA':
        return TipoLezione.YOGA;
      default:
        console.warn('Categoria pacchetto non riconosciuta:', categoria, '- usando PRIVATA come default');
        return TipoLezione.PRIVATA;
    }
  }

  ngOnInit() {
    console.log('FormLezioneComponent ngOnInit, dati:', this.lezioneToEdit);

    // Carica i pacchetti e solo dopo gestisci la precompilazione
    this.loadPacchetti = this.loadPacchetti.bind(this);
    this.loadPacchetti(() => {
      this.modaleService.config$.subscribe(config => {
        console.log('📦 Config ricevuto nel form:', config);
        if (config?.dati && Object.keys(config.dati).length > 0) {
          this.lezioneToEdit = config.dati;
          this.isEditMode = true;
          if (this.form && this.lezioneToEdit) {
            this.populateFormForEdit();
          }
        } else {
          this.isEditMode = false;
          this.lezioneToEdit = undefined;
        }
        if (config?.onConferma) {
          console.log('✅ Callback onConferma trovato:', config.onConferma);
        } else {
          console.log('❌ Nessun callback onConferma trovato');
        }
      });
    });
    this.initForm();
    this.setupAutocomplete();
    // Subscribe to form status changes to update button state
    this.form.statusChanges?.subscribe(() => {
      // Trigger change detection when form status changes
      this.cdr.detectChanges();
    });
  }

  private setupAutocomplete() {
    // Setup autocomplete per utenti
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

  private loadPacchetti(callback?: () => void) {
    this.pacchettiService.getListaPacchetti().subscribe({
      next: (pacchetti) => {
        this.pacchettiDisponibili = pacchetti.filter(p => p.attivo); // Solo pacchetti attivi
        console.log('📚 Pacchetti caricati:', this.pacchettiDisponibili);
        if (callback) callback();
      },
      error: (error) => {
        console.error('Errore nel caricamento pacchetti:', error);
        this.toastr.error('Errore nel caricamento dei pacchetti');
        if (callback) callback();
      }
    });
  }

  private populateFormForEdit() {
    if (!this.lezioneToEdit?.dataInizio) {
      console.error('Data di inizio mancante per la lezione da modificare');
      return;
    }

    // Formatta la data per l'input solo se è valida
    const dataInizio = new Date(this.lezioneToEdit.dataInizio);
    if (isNaN(dataInizio.getTime())) {
      console.error('Data non valida:', this.lezioneToEdit.dataInizio);
      this.toastr.error('Errore nel formato della data');
      return;
    }
    const dataFormatted = dataInizio.toISOString().split('T')[0];
    const oraFormatted = dataInizio.toTimeString().slice(0, 5);

    // Trova il pacchetto corrispondente al tipo della lezione (se possibile)
    let pacchettoSelezionato = null;
    if (this.lezioneToEdit.tipo && this.pacchettiDisponibili.length > 0) {
      // Prova a trovare il pacchetto che mappa il tipo/categoria
      pacchettoSelezionato = this.pacchettiDisponibili.find(pacchetto => {
        // Mappiamo la categoria del pacchetto con il tipo della lezione
        return this.mapCategoriaToTipoLezione(pacchetto.categoria) === this.lezioneToEdit!.tipo;
      });
    }
    // Fallback: primo pacchetto disponibile
    if (!pacchettoSelezionato && this.pacchettiDisponibili.length > 0) {
      pacchettoSelezionato = this.pacchettiDisponibili[0];
    }

    this.form.patchValue({
  pacchettoId: pacchettoSelezionato ? pacchettoSelezionato.id : '',
  titolo: this.lezioneToEdit.titolo || '',
  dataInizio: dataFormatted,
  oraInizio: oraFormatted,
  durata: pacchettoSelezionato ? pacchettoSelezionato.durataMinuti : '',
  maxPartecipanti: pacchettoSelezionato ? pacchettoSelezionato.maxPartecipanti : '',
  prezzo: pacchettoSelezionato ? pacchettoSelezionato.prezzo : '',
  note: this.lezioneToEdit.note || ''
    });

    this.maxPartecipantiCorrente = pacchettoSelezionato ? pacchettoSelezionato.maxPartecipanti : 0;

    // Carica i dati completi dei partecipanti (se presenti)
    if (this.lezioneToEdit.partecipanti && this.lezioneToEdit.partecipanti.length > 0) {
      this.userService.getUtentiByUsernames(this.lezioneToEdit.partecipanti).subscribe({
        next: (utenti) => {
          this.partecipantiSelezionati = utenti.map(u => ({
            username: u.username,
            nome: u.nome,
            cognome: u.cognome,
            email: u.email,
            nominativo: u.nome && u.cognome ? `${u.nome} ${u.cognome}` : u.username,
            displayText: u.nome && u.cognome ? `${u.nome} ${u.cognome} (${u.username})` : u.username
          }));
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Errore nel caricamento dati partecipanti:', err);
          // Fallback: mostra solo username
          this.partecipantiSelezionati = this.lezioneToEdit!.partecipanti.map(username => ({
            username,
            email: '',
            nominativo: username,
            displayText: username
          }));
          this.cdr.detectChanges();
        }
      });
    } else {
      this.partecipantiSelezionati = [];
      this.cdr.detectChanges();
    }

    // I campi disabilitati si popolano automaticamente quando cambia pacchettoId
    console.log('Form popolato per edit con patchValue:', this.form.value);
  }

  private getFormattedDate(): string {
    if (!this.lezioneToEdit?.dataInizio) return '';
    const dataInizio = new Date(this.lezioneToEdit.dataInizio);
    if (isNaN(dataInizio.getTime())) return '';
    
    console.log('Data originale lezione:', this.lezioneToEdit.dataInizio);
    console.log('Data convertita:', dataInizio);
    
    // Usa getFullYear, getMonth, getDate per evitare problemi di fuso orario
    const year = dataInizio.getFullYear();
    const month = String(dataInizio.getMonth() + 1).padStart(2, '0');
    const day = String(dataInizio.getDate()).padStart(2, '0');
    const formatted = `${year}-${month}-${day}`;
    console.log('Data formattata per form:', formatted);
    return formatted;
  }

  private getFormattedTime(): string {
    if (!this.lezioneToEdit?.dataInizio) return '';
    const dataInizio = new Date(this.lezioneToEdit.dataInizio);
    if (isNaN(dataInizio.getTime())) return '';
    
    console.log('Ora originale lezione:', this.lezioneToEdit.dataInizio);
    console.log('Ora convertita:', dataInizio);
    
    // Usa getHours e getMinutes per evitare problemi di fuso orario
    const hours = String(dataInizio.getHours()).padStart(2, '0');
    const minutes = String(dataInizio.getMinutes()).padStart(2, '0');
    const formatted = `${hours}:${minutes}`;
    console.log('Ora formattata per form:', formatted);
    return formatted;
  }

  private initForm() {
    this.form = this.fb.group({
      pacchettoId: [this.lezioneToEdit?.tipo || '', Validators.required],
      titolo: [this.lezioneToEdit?.titolo || '', [Validators.required, Validators.minLength(3)]],
      dataInizio: [this.getFormattedDate(), Validators.required],
      oraInizio: [this.getFormattedTime(), Validators.required],
      durata: [{value: this.lezioneToEdit?.durata || 0, disabled: true}, [Validators.required, Validators.min(15), Validators.max(180)]],
      istruttore: [{value: this.ISTRUTTORE_FISSO, disabled: true}, Validators.required],
      maxPartecipanti: [{value: this.lezioneToEdit?.maxPartecipanti || 0, disabled: true}, [Validators.required, Validators.min(1), Validators.max(50)]],
      prezzo: [{value: this.lezioneToEdit?.prezzo || 0, disabled: true}, [Validators.required, Validators.min(0)]],
      note: [this.lezioneToEdit?.note || '']
    });

    // Auto-compilazione quando cambia il pacchetto selezionato
    this.form.get('pacchettoId')?.valueChanges.subscribe(pacchettoId => {
      const pacchettoSelezionato = this.pacchettiDisponibili.find(p => p.id === parseInt(pacchettoId));
      if (pacchettoSelezionato) {
        // Auto-compila i campi disabilitati
        this.form.get('durata')?.setValue(pacchettoSelezionato.durataMinuti);
        this.form.get('maxPartecipanti')?.setValue(pacchettoSelezionato.maxPartecipanti);
        this.form.get('prezzo')?.setValue(pacchettoSelezionato.prezzo);

        // Aggiorna il limite partecipanti corrente
        this.maxPartecipantiCorrente = pacchettoSelezionato.maxPartecipanti || 1;

        // Verifica se i partecipanti selezionati superano il nuovo limite
        if (this.partecipantiSelezionati.length > this.maxPartecipantiCorrente) {
          this.toastr.warning(`Il pacchetto selezionato permette massimo ${this.maxPartecipantiCorrente} partecipanti. Alcuni partecipanti sono stati rimossi.`);
          this.partecipantiSelezionati = this.partecipantiSelezionati.slice(0, this.maxPartecipantiCorrente);
          this.updatePartecipantiFormValue();
        }

        console.log('🎯 Auto-compilato da pacchetto:', {
          durata: pacchettoSelezionato.durataMinuti,
          maxPartecipanti: pacchettoSelezionato.maxPartecipanti,
          prezzo: pacchettoSelezionato.prezzo
        });
      }
    });
  }

  onSubmit() {
    console.log('📝 onSubmit chiamato, isEditMode:', this.isEditMode);
    if (this.form.valid) {
      this.isLoading = true;
      const formData = this.form.value;

      // Trova il pacchetto selezionato per ottenere il nome/tipo
      const pacchettoSelezionato = this.pacchettiDisponibili.find(p => p.id === parseInt(formData.pacchettoId));
      if (!pacchettoSelezionato) {
        this.toastr.error('Pacchetto selezionato non valido');
        this.isLoading = false;
        return;
      }
      
      // Combina data e ora mantenendo il fuso orario locale
      const [year, month, day] = formData.dataInizio.split('-').map(Number);
      const [hours, minutes] = formData.oraInizio.split(':').map(Number);
      
      const dataOra = new Date(year, month - 1, day, hours, minutes);
      
      console.log('Data creata dal form:', dataOra);
      console.log('Dati form originali:', formData.dataInizio, formData.oraInizio);
      
      // Ottieni i valori dai campi disabilitati
      const durata = this.form.get('durata')?.value || pacchettoSelezionato.durataMinuti;
      const maxPartecipanti = this.form.get('maxPartecipanti')?.value || pacchettoSelezionato.maxPartecipanti;
      const prezzo = this.form.get('prezzo')?.value || pacchettoSelezionato.prezzo;

      const lezione: ILezione = {
        id: this.isEditMode ? this.lezioneToEdit?.id : undefined,
        tipo: this.mapCategoriaToTipoLezione(pacchettoSelezionato.categoria), // Uso la funzione di mapping
        titolo: formData.titolo,
        dataInizio: dataOra,
        dataFine: new Date(dataOra.getTime() + durata * 60000),
        durata: durata,
        istruttoreId: 0, // Placeholder, non più utilizzato nel backend
        istruttore: this.ISTRUTTORE_FISSO, // Sempre Laura Caratti
        maxPartecipanti: maxPartecipanti,
        partecipantiIscritti: this.partecipantiSelezionati.length,
  partecipanti: this.partecipantiSelezionati.map(p => p.username),
  stato: this.isEditMode ? (this.lezioneToEdit?.stato || StatoLezione.CONFERMATA) : StatoLezione.CONFERMATA,
  prezzo: prezzo,
  note: formData.note || '',
  attiva: this.isEditMode ? (this.lezioneToEdit?.attiva ?? true) : true
      };

      console.log('🎯 Lezione creata dal form:', lezione);

      // In entrambi i casi (creazione o modifica), chiama il callback onConferma se presente
      const sub = this.modaleService.config$.subscribe(config => {
        if (config?.onConferma) {
          console.log('🚀 Chiamando callback onConferma');
          config.onConferma(lezione);
          this.isLoading = false;
          sub.unsubscribe();
        } else {
          // Fallback: se non c'è callback, esegui la chiamata diretta solo in creazione
          if (!this.isEditMode) {
            // this.eseguiSalvataggioDiretto(lezione, false);
          }
          sub.unsubscribe();
        }
      });
      return;
    } else {
      this.markFormGroupTouched();
    }
  }

  /**
   * Esegue la chiamata diretta al service per creazione o modifica
   */
  // private eseguiSalvataggioDiretto(lezione: ILezione, isEdit: boolean) {
  //   const operation = isEdit && this.lezioneToEdit?.id
  //     ? this.lezioniService.updateLezione(this.lezioneToEdit.id, lezione)
  //     : this.lezioniService.createLezione(lezione);
  //   operation.subscribe({
  //     next: () => {
  //       this.toastr.success(
  //         isEdit ? 'Lezione aggiornata con successo' : 'Lezione creata con successo'
  //       );
  //       // Il refresh della lista viene gestito da agenda.component.ts
  //       this.modaleService.chiudi();
  //     },
  //     error: (error: any) => {
  //       console.error('Errore nel salvataggio della lezione:', error);
  //       this.toastr.error('Errore nel salvataggio della lezione');
  //       this.isLoading = false;
  //     },
  //     complete: () => {
  //       this.isLoading = false;
  //     }
  //   });
  // }

  private markFormGroupTouched() {
    Object.keys(this.form.controls).forEach(key => {
      const control = this.form.get(key);
      control?.markAsTouched();
    });
  }

  onCancel() {
    this.modaleService.chiudi();
  }

  // Metodo chiamato dal modal component per la conferma
  confermaForm() {
    this.onSubmit();
  }

  // Metodi per gestione partecipanti
  aggiungiPartecipante(utente: IUtenteAutocomplete) {
    // Verifica se già selezionato
    if (this.partecipantiSelezionati.find(p => p.username === utente.username)) {
      this.toastr.warning('Partecipante già aggiunto');
      return;
    }

    // Verifica limite massimo partecipanti
    if (this.partecipantiSelezionati.length >= this.maxPartecipantiCorrente) {
      this.toastr.error(`Massimo ${this.maxPartecipantiCorrente} partecipanti per questo tipo di lezione`);
      return;
    }

    this.partecipantiSelezionati.push(utente);
    this.autocompleteSearch.setValue('');
    this.showAutocomplete = false;
    this.updatePartecipantiFormValue();
  }

  rimuoviPartecipante(username: string) {
    this.partecipantiSelezionati = this.partecipantiSelezionati.filter(p => p.username !== username);
    this.updatePartecipantiFormValue();
  }

  private updatePartecipantiFormValue() {
    const usernames = this.partecipantiSelezionati.map(p => p.username);
    // Se abbiamo un campo partecipanti nel form, aggiorniamolo
    // Altrimenti teniamo la lista aggiornata per l'invio
  }

  onAutocompleteClick(utente: IUtenteAutocomplete) {
    this.aggiungiPartecipante(utente);
  }

  onAutocompleteBlur() {
    // Delay per permettere il click sulle suggestions
    setTimeout(() => {
      this.showAutocomplete = false;
    }, 200);
  }

  onAutocompleteFocus() {
    if (this.autocompleteSearch.value && this.utentiSuggestions.length > 0) {
      this.showAutocomplete = true;
    }
  }

  get postiDisponibili(): number {
    return this.maxPartecipantiCorrente - this.partecipantiSelezionati.length;
  }

}