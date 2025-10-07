import { Component, OnInit, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModaleService } from '../../../../core/services/modal.service';
import { LezioniService, LezioneDto } from '../../../../core/services/lezioni.service';
import { ILezione, TipoLezione, TIPI_LEZIONE_CONFIG } from '../../../../shared/models/Lezione';

@Component({
  selector: 'app-modifica-lezione-overlay',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './modifica-lezione-overlay.component.html',
  styleUrls: ['./modifica-lezione-overlay.component.css']
})
export class ModificaLezioneOverlayComponent implements OnInit {
  @Output() conferma = new EventEmitter<any>();

  private modaleService = inject(ModaleService);
  private lezioniService = inject(LezioniService);
  private fb = inject(FormBuilder);

  // Stato del componente
  loading = false;
  loadingForm = false;
  step: 'selection' | 'form' = 'selection';
  
  // Lista lezioni disponibili
  lezioni: ILezione[] = [];
  lezioniFiltered: ILezione[] = [];
  
  // Lezione selezionata
  selectedLezione: ILezione | null = null;
  
  // Form per la modifica
  form!: FormGroup;
  submitted = false;

  // Opzioni per le tendine
  tipiLezione = Object.values(TipoLezione);
  istruttori = ['Eleonora', 'Marco', 'Sofia']; // TODO: Recuperare dal backend

  ngOnInit() {
    this.initializeForm();
    this.loadLezioni();
  }

  private initializeForm() {
    this.form = this.fb.group({
      titolo: ['', [Validators.required, Validators.minLength(3)]],
      dataInizio: ['', Validators.required],
      dataFine: ['', Validators.required],
      tipo: ['', Validators.required],
      istruttore: ['', Validators.required],
      note: [''],
      attiva: [true]
    }, { validators: this.dateValidator });
  }

  private loadLezioni() {
    this.loading = true;
    this.lezioniService.getLezioni().subscribe({
      next: (lezioni) => {
        this.lezioni = lezioni.sort((a, b) => 
          new Date(b.dataInizio).getTime() - new Date(a.dataInizio).getTime()
        );
        this.lezioniFiltered = [...this.lezioni];
        this.loading = false;
      },
      error: (error) => {
        console.error('Errore nel caricamento delle lezioni:', error);
        this.loading = false;
      }
    });
  }

  onLezioneSelected(lezione: ILezione) {
    this.selectedLezione = lezione;
    this.populateForm(lezione);
    this.step = 'form';
  }

  private populateForm(lezione: ILezione) {
    // Converti le date in formato datetime-local per i campi input
    const dataInizio = this.toDateTimeLocalString(lezione.dataInizio);
    const dataFine = this.toDateTimeLocalString(lezione.dataFine);

    this.form.patchValue({
      titolo: lezione.titolo,
      dataInizio: dataInizio,
      dataFine: dataFine,
      tipo: lezione.tipo,
      istruttore: lezione.istruttore,
      note: lezione.note || '',
      attiva: lezione.attiva !== undefined ? lezione.attiva : true
    });
  }

  private toDateTimeLocalString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  private dateValidator(formGroup: FormGroup) {
    const dataInizio = formGroup.get('dataInizio')?.value;
    const dataFine = formGroup.get('dataFine')?.value;

    if (dataInizio && dataFine) {
      const startDate = new Date(dataInizio);
      const endDate = new Date(dataFine);

      if (endDate <= startDate) {
        return { dateRange: true };
      }
    }
    return null;
  }

  onSearchLezioni(event: Event) {
    const searchTerm = (event.target as HTMLInputElement).value.toLowerCase();
    if (!searchTerm) {
      this.lezioniFiltered = [...this.lezioni];
    } else {
      this.lezioniFiltered = this.lezioni.filter(lezione =>
        lezione.titolo.toLowerCase().includes(searchTerm) ||
        lezione.istruttore.toLowerCase().includes(searchTerm) ||
        this.getLabelTipoLezione(lezione.tipo).toLowerCase().includes(searchTerm)
      );
    }
  }

  backToSelection() {
    this.step = 'selection';
    this.selectedLezione = null;
    this.form.reset();
    this.submitted = false;
  }

  confermaForm() {
    this.submitted = true;
    
    if (this.form.valid && this.selectedLezione) {
      this.loadingForm = true;
      
      const formValue = this.form.value;
      const lezioneModificata: ILezione = {
        ...this.selectedLezione,
        titolo: formValue.titolo,
        dataInizio: new Date(formValue.dataInizio),
        dataFine: new Date(formValue.dataFine),
        tipo: formValue.tipo,
        istruttore: formValue.istruttore,
        note: formValue.note,
        attiva: formValue.attiva
      };

      this.lezioniService.updateLezione(this.selectedLezione.id!, lezioneModificata).subscribe({
        next: (lezioneAggiornata) => {
          this.loadingForm = false;
          this.conferma.emit(lezioneAggiornata);
          this.modaleService.chiudi();
        },
        error: (error) => {
          console.error('Errore nella modifica della lezione:', error);
          this.loadingForm = false;
        }
      });
    }
  }

  annulla() {
    this.modaleService.chiudi();
  }

  getLabelTipoLezione(tipo: string): string {
    return TIPI_LEZIONE_CONFIG[tipo as keyof typeof TIPI_LEZIONE_CONFIG]?.label || tipo;
  }

  formatDataLezione(data: Date): string {
    const d = new Date(data);
    const giorno = d.getDate().toString().padStart(2, '0');
    const mese = (d.getMonth() + 1).toString().padStart(2, '0');
    const anno = d.getFullYear();
    const ore = d.getHours().toString().padStart(2, '0');
    const minuti = d.getMinutes().toString().padStart(2, '0');
    return `${giorno}/${mese}/${anno} ${ore}:${minuti}`;
  }

  // Helper per verificare errori nei campi
  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.submitted));
  }

  getFieldError(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (field && field.errors) {
      if (field.errors['required']) return `${fieldName} è obbligatorio`;
      if (field.errors['minlength']) return `${fieldName} deve avere almeno ${field.errors['minlength'].requiredLength} caratteri`;
    }
    return '';
  }
}