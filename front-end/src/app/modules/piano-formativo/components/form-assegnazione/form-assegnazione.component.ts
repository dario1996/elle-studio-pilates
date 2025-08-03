import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IDipendenti } from '../../../../shared/models/Dipendenti';
import { ICorsi } from '../../../../shared/models/Corsi';
import { DipendentiService } from '../../../../core/services/data/dipendenti.service';
import { CorsiService } from '../../../../core/services/data/corsi.service';

@Component({
  selector: 'app-form-assegnazione',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-assegnazione.component.html',
  styleUrl: './form-assegnazione.component.css'
})
export class FormAssegnazioneComponent implements OnInit {
  @Input() dati: any = {};
  @Output() conferma = new EventEmitter<any>();

  form: FormGroup;
  dipendenti: IDipendenti[] = [];
  corsi: ICorsi[] = [];
  submitted = false;

  // Per la ricerca dipendenti
  dipendentiFiltrati: IDipendenti[] = [];
  showDipendentiDropdown = false;
  dipendenteSelezionato: IDipendenti | null = null;
  
  // Per la ricerca corsi
  corsiFiltrati: ICorsi[] = [];
  showCorsiDropdown = false;
  corsoSelezionato: ICorsi | null = null;

  // Cambia da singolo a array
  dipendentiSelezionati: IDipendenti[] = [];

  // Aggiungi per la multiselezione corsi
  corsiSelezionati: ICorsi[] = [];
  
  constructor(
    private fb: FormBuilder,
    private dipendentiService: DipendentiService,
    private corsiService: CorsiService
  ) {
    this.form = this.fb.group({
      dipendentiIds: [[], Validators.required],
      corsiIds: [[], Validators.required], // AGGIUNGI: Array di corsi
      searchDipendente: [''],
      searchCorso: [''],
      obbligatorio: [false],
      dataTerminePrevista: ['']
    });
  }

  ngOnInit() {
    this.loadData();
    this.setupSearchListeners();
  }

  private loadData() {
    // Carica dipendenti
    this.dipendentiService.getListaDipendenti().subscribe({
      next: (dipendenti) => {
        this.dipendenti = dipendenti.filter(d => d.attivo);
        this.dipendentiFiltrati = [...this.dipendenti];
      },
      error: (error) => {
        console.error('❌ Errore caricamento dipendenti:', error);
      }
    });

    // Carica corsi
    this.corsiService.getListaCorsi().subscribe({
      next: (corsi) => {
        if (corsi && corsi.length > 0) {
          // RIMOSSO IL FILTRO PER ORA - prendiamo tutti i corsi
          this.corsi = corsi;
          this.corsiFiltrati = [...this.corsi];
        }
      },
      error: (error) => {
        console.error('❌ Errore caricamento corsi:', error);
      }
    });
  }

  private setupSearchListeners() {
    // Listener per la ricerca dipendenti
    this.form.get('searchDipendente')?.valueChanges.subscribe(value => {
      this.filtraDipendenti(value);
    });

    // RIMUOVI: questo listener perché ora usi onSearchCorso
    // this.form.get('searchCorso')?.valueChanges.subscribe(value => {
    //   this.filtraCorsi(value);
    // });
  }

  filtraDipendenti(searchTerm: string) {
    // Mostra dropdown solo se c'è un termine di ricerca
    if (!searchTerm || searchTerm.length === 0) {
      this.dipendentiFiltrati = [];
      this.showDipendentiDropdown = false;
      return;
    }
    // Mostra dropdown solo se c'è almeno 1 carattere
    if (searchTerm.length < 1) {
      this.dipendentiFiltrati = [];
      this.showDipendentiDropdown = false;
      return;
    }

    const term = searchTerm.toLowerCase();
    this.dipendentiFiltrati = this.dipendenti.filter(d => 
      d.nome.toLowerCase().includes(term) ||
      d.cognome.toLowerCase().includes(term) ||
      d.email.toLowerCase().includes(term) ||
      `${d.nome} ${d.cognome}`.toLowerCase().includes(term)
    );

    // Mostra dropdown solo se ci sono risultati
    this.showDipendentiDropdown = this.dipendentiFiltrati.length > 0;
  }

  filtraCorsi(searchTerm: string) {
    if (!searchTerm || searchTerm.length === 0) {
      this.corsiFiltrati = [];
      this.showCorsiDropdown = false;
      return;
    }

    if (searchTerm.length < 1) {
      this.corsiFiltrati = [];
      this.showCorsiDropdown = false;
      return;
    }

    const term = searchTerm.toLowerCase();
    this.corsiFiltrati = this.corsi.filter(c => {
      const matchNome = c.nome?.toLowerCase().includes(term);
      const matchArgomento = c.argomento?.toLowerCase().includes(term);
      const matchPiattaforma = c.piattaforma?.nome?.toLowerCase().includes(term);
      
      return matchNome || matchArgomento || matchPiattaforma;
    });
  }

  selezionaDipendente(dipendente: IDipendenti) {
    this.dipendenteSelezionato = dipendente;
    this.form.patchValue({
      dipendenteId: dipendente.id,
      searchDipendente: `${dipendente.nome} ${dipendente.cognome}`
    });
    this.showDipendentiDropdown = false;
  }

  selezionaCorso(corso: ICorsi) {
    // Se siamo in modalità compatibilità con il vecchio sistema
    if (this.corsiSelezionati.length === 0) {
      this.corsoSelezionato = corso;
      this.form.patchValue({
        corsoId: corso.id,
        searchCorso: corso.nome
      });
    }
    
    // Aggiungi alla multiselezione
    this.aggiungiCorso(corso);
    this.showCorsiDropdown = false;
  }
  
  aggiungiDipendente(dipendente: IDipendenti) {
    // Se ci sono già più corsi, blocca la multiselezione dipendenti
    if (this.corsiSelezionati.length > 1) {
      // Rimuovi dipendenti esistenti e aggiungi solo questo
      this.dipendentiSelezionati = [dipendente];
    } else {
      // Controlla se già selezionato
      if (!this.dipendentiSelezionati.find(d => d.id === dipendente.id)) {
        this.dipendentiSelezionati.push(dipendente);
        
        // Se ora abbiamo più dipendenti, riduci corsi a massimo 1
        if (this.dipendentiSelezionati.length > 1 && this.corsiSelezionati.length > 1) {
          this.corsiSelezionati = this.corsiSelezionati.slice(0, 1);
          this.aggiornaCorsiIds();
        }
      }
    }
    
    this.aggiornaDipendentiIds();
    
    // Reset campo ricerca
    this.form.get('searchDipendente')?.setValue('');
    this.showDipendentiDropdown = false;
  }

  aggiungiCorso(corso: ICorsi) {
    // Se ci sono già più dipendenti, blocca la multiselezione corsi
    if (this.dipendentiSelezionati.length > 1) {
      // Rimuovi corsi esistenti e aggiungi solo questo
      this.corsiSelezionati = [corso];
    } else {
      // Controlla se già selezionato
      if (!this.corsiSelezionati.find(c => c.id === corso.id)) {
        this.corsiSelezionati.push(corso);
        
        // Se ora abbiamo più corsi, riduci dipendenti a massimo 1
        if (this.corsiSelezionati.length > 1 && this.dipendentiSelezionati.length > 1) {
          this.dipendentiSelezionati = this.dipendentiSelezionati.slice(0, 1);
          this.aggiornaDipendentiIds();
        }
      }
    }
    
    this.aggiornaCorsiIds();
    
    // Reset campo ricerca
    this.form.get('searchCorso')?.setValue('');
    this.showCorsiDropdown = false;
  }

  rimuoviDipendente(index: number) {
    this.dipendentiSelezionati.splice(index, 1);
    this.aggiornaDipendentiIds();
  }

  rimuoviCorso(index: number) {
    this.corsiSelezionati.splice(index, 1);
    this.aggiornaCorsiIds();
  }

  private aggiornaDipendentiIds() {
    const ids = this.dipendentiSelezionati.map(d => d.id);
    this.form.get('dipendentiIds')?.setValue(ids);
  }

  private aggiornaCorsiIds() {
    const ids = this.corsiSelezionati.map(c => c.id);
    this.form.get('corsiIds')?.setValue(ids);
  }

  onSubmit() {
    if (this.form.valid) {
      const formData = {
        dipendentiIds: this.form.value.dipendentiIds,
        corsiIds: this.form.value.corsiIds, // AGGIUNGI
        obbligatorio: this.form.value.obbligatorio,
        dataTerminePrevista: this.form.value.dataTerminePrevista
      };
      this.conferma.emit(formData);
    }
  }

  clearDipendente() {
    this.dipendenteSelezionato = null;
    this.form.patchValue({
      dipendenteId: '',
      searchDipendente: ''
    });
  }

  clearCorso() {
    this.corsoSelezionato = null;
    this.form.patchValue({
      corsoId: '',
      searchCorso: ''
    });
  }

  onDipendenteBlur() {
    // Ritarda la chiusura del dropdown per permettere il click
    setTimeout(() => {
      this.showDipendentiDropdown = false;
    }, 200);
  }

  onCorsoBlur() {
    // Ritarda la chiusura del dropdown per permettere il click
    setTimeout(() => {
      this.showCorsiDropdown = false;
    }, 200);
  }

  confermaForm() {
    this.onSubmit();
  }

  // MIGLIORA: Gestione del focus per i dipendenti
  onDipendenteFocus() {
    if (this.isPossibileAggiungereDipendenti) {
      this.showDipendentiDropdown = true;
    }
  }

  // MIGLIORA: Gestione del focus per i corsi  
  onCorsoFocus() {
    if (this.isPossibileAggiungereCorsi) {
      this.showCorsiDropdown = true;
    }
  }

  // MIGLIORA: Gestione della ricerca dipendenti
  onSearchDipendente(event: any) {
    const searchTerm = event.target.value;
    
    if (searchTerm.length >= 1) {
      this.filtraDipendenti(searchTerm);
      this.showDipendentiDropdown = true; // Sempre true quando si cerca
    } else {
      this.dipendentiFiltrati = [];
      this.showDipendentiDropdown = false;
    }
  }

  // Gestione ricerca corsi
  onSearchCorso(event: any) {
    const searchTerm = event.target.value;
    
    if (searchTerm.length >= 1) {
      this.filtraCorsi(searchTerm);
      this.showCorsiDropdown = true; // Sempre true quando si cerca
    } else {
      this.corsiFiltrati = [];
      this.showCorsiDropdown = false;
    }
  }

  // MODIFICA: Permettere sempre la ricerca, ma limitare la selezione
  get isPossibileAggiungereCorsi(): boolean {
    // Sempre possibile cercare, ma limitare la selezione se necessario
    return true;
  }

  get isPossibileAggiungereDipendenti(): boolean {
    // Sempre possibile cercare, ma limitare la selezione se necessario
    return true;
  }

  // AGGIUNGI: Nuovi getter per controllare se è possibile SELEZIONARE
  get isPossibileSelezionareCorsi(): boolean {
    return this.dipendentiSelezionati.length <= 1;
  }

  get isPossibileSelezionareDipendenti(): boolean {
    return this.corsiSelezionati.length <= 1;
  }

  // MODIFICA: Mostra dropdown basato solo sui risultati filtrati
  get shouldShowCorsiDropdown(): boolean {
    return this.showCorsiDropdown && 
           (this.corsiFiltrati.length > 0 || this.showCorsiBloccoMessage);
  }

  get shouldShowDipendentiDropdown(): boolean {
    return this.showDipendentiDropdown && 
           (this.dipendentiFiltrati.length > 0 || this.showDipendentiBloccoMessage);
  }

  // AGGIORNA: Messaggi di blocco più specifici
  get showDipendentiBloccoMessage(): boolean {
    return this.showDipendentiDropdown && 
           this.dipendentiFiltrati.length > 0 && 
           !this.isPossibileSelezionareDipendenti;
  }

  get showCorsiBloccoMessage(): boolean {
    return this.showCorsiDropdown && 
           this.corsiFiltrati.length > 0 && 
           !this.isPossibileSelezionareCorsi;
  }

  get messaggioLimitazione(): string {
    // Mostra il messaggio solo se ci sono effettivamente limitazioni attive
    if (this.dipendentiSelezionati.length > 1 && this.corsiSelezionati.length > 0) {
      return `Hai selezionato ${this.dipendentiSelezionati.length} dipendenti. Puoi selezionare solo 1 corso.`;
    }
    if (this.corsiSelezionati.length > 1 && this.dipendentiSelezionati.length > 0) {
      return `Hai selezionato ${this.corsiSelezionati.length} corsi. Puoi selezionare solo 1 dipendente.`;
    }
    return '';
  }
}
