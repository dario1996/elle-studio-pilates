import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModaleService } from '../../../../core/services/modal.service';
import { ToastrService } from 'ngx-toastr';
import { LezioniService } from '../../services/lezioni.service';
import { ILezione, TipoLezione } from '../../models/lezione.model';

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
  private cdr = inject(ChangeDetectorRef);

  form!: FormGroup;
  lezioneToEdit?: ILezione;  // Questa è la proprietà che riceverà i dati dal modal
  isEditMode = false;
  isLoading = false;

  tipiLezione = [
    { value: TipoLezione.PRIVATA, label: 'Lezione Privata', maxPartecipanti: 1, durata: 50 },
    { value: TipoLezione.PRIMA_LEZIONE, label: 'Prima Lezione', maxPartecipanti: 1, durata: 60 },
    { value: TipoLezione.SEMI_PRIVATA_DUETTO, label: 'Semi-Privata Duetto', maxPartecipanti: 2, durata: 50 },
    { value: TipoLezione.SEMI_PRIVATA_GRUPPO, label: 'Semi-Privata Gruppo', maxPartecipanti: 4, durata: 50 },
    { value: TipoLezione.MATWORK, label: 'Matwork', maxPartecipanti: 8, durata: 50 },
    { value: TipoLezione.YOGA, label: 'Yoga', maxPartecipanti: 8, durata: 60 }
  ];

  istruttori = [
    { id: 1, nome: 'Eleonora', cognome: 'Bianchi' },
    { id: 2, nome: 'Marco', cognome: 'Rossi' },
    { id: 3, nome: 'Sofia', cognome: 'Verdi' }
  ];

  ngOnInit() {
    console.log('FormLezioneComponent ngOnInit, dati:', this.lezioneToEdit);
    this.modaleService.config$.subscribe(config => {
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
    });
    this.initForm();
    
    // Subscribe to form status changes to update button state
    this.form.statusChanges?.subscribe(() => {
      // Trigger change detection when form status changes
      this.cdr.detectChanges();
    });
  }

  private populateFormForEdit() {
    if (!this.lezioneToEdit?.dataInizio) {
      console.error('Data di inizio mancante per la lezione da modificare');
      return;
    }

    // Formatta la data per l'input solo se è valida
    const dataInizio = new Date(this.lezioneToEdit.dataInizio);
    
    // Controlla se la data è valida
    if (isNaN(dataInizio.getTime())) {
      console.error('Data non valida:', this.lezioneToEdit.dataInizio);
      this.toastr.error('Errore nel formato della data');
      return;
    }
    
    const dataFormatted = dataInizio.toISOString().split('T')[0];
    const oraFormatted = dataInizio.toTimeString().slice(0, 5);
    
    this.form.patchValue({
      tipo: this.lezioneToEdit.tipo || '',
      titolo: this.lezioneToEdit.titolo || '',
      descrizione: this.lezioneToEdit.descrizione || '',
      dataInizio: dataFormatted,
      oraInizio: oraFormatted,
      durata: this.lezioneToEdit.durata || 50,
      istruttoreId: this.lezioneToEdit.istruttoreId || null,
      maxPartecipanti: this.lezioneToEdit.maxPartecipanti || 1,
      prezzo: this.lezioneToEdit.prezzo || 0,
      note: this.lezioneToEdit.note || ''
    });
    console.log('Form popolato con patchValue:', this.form.value);
  }

  private getFormattedDate(): string {
    if (!this.lezioneToEdit?.dataInizio) return '';
    const dataInizio = new Date(this.lezioneToEdit.dataInizio);
    if (isNaN(dataInizio.getTime())) return '';
    return dataInizio.toISOString().split('T')[0];
  }

  private getFormattedTime(): string {
    if (!this.lezioneToEdit?.dataInizio) return '';
    const dataInizio = new Date(this.lezioneToEdit.dataInizio);
    if (isNaN(dataInizio.getTime())) return '';
    return dataInizio.toTimeString().slice(0, 5);
  }

  private initForm() {
    this.form = this.fb.group({
      tipo: [this.lezioneToEdit?.tipo || TipoLezione.PRIVATA, Validators.required],
      titolo: [this.lezioneToEdit?.titolo || '', [Validators.required, Validators.minLength(3)]],
      descrizione: [this.lezioneToEdit?.descrizione || ''],
      dataInizio: [this.getFormattedDate(), Validators.required],
      oraInizio: [this.getFormattedTime(), Validators.required],
      durata: [this.lezioneToEdit?.durata || 50, [Validators.required, Validators.min(30), Validators.max(120)]],
      istruttoreId: [this.lezioneToEdit?.istruttoreId || null, Validators.required],
      maxPartecipanti: [this.lezioneToEdit?.maxPartecipanti || 1, [Validators.required, Validators.min(1), Validators.max(8)]],
      prezzo: [this.lezioneToEdit?.prezzo || 0, [Validators.required, Validators.min(0)]],
      note: [this.lezioneToEdit?.note || '']
    });

    // Aggiorna durata e maxPartecipanti quando cambia il tipo
    this.form.get('tipo')?.valueChanges.subscribe(tipo => {
      const tipoInfo = this.tipiLezione.find(t => t.value === tipo);
      if (tipoInfo) {
        this.form.patchValue({
          durata: tipoInfo.durata,
          maxPartecipanti: tipoInfo.maxPartecipanti
        });
      }
    });
  }

  private populateForm() {
    if (this.lezioneToEdit) {
      console.log('Populating form with data:', this.lezioneToEdit);
      
      // Gestione più robusta della data
      let dataInizio: Date;
      if (typeof this.lezioneToEdit.dataInizio === 'string') {
        dataInizio = new Date(this.lezioneToEdit.dataInizio);
      } else {
        dataInizio = this.lezioneToEdit.dataInizio;
      }
      
      // Controllo se la data è valida
      if (isNaN(dataInizio.getTime())) {
        console.error('Data non valida:', this.lezioneToEdit.dataInizio);
        this.toastr.error('Errore nel formato della data');
        return;
      }
      
      const dataFormatted = dataInizio.toISOString().split('T')[0];
      const oraFormatted = dataInizio.toTimeString().slice(0, 5);
      
      console.log('Data formattata:', dataFormatted, 'Ora formattata:', oraFormatted);

      // Usa setValue invece di patchValue per essere più espliciti
      this.form.setValue({
        tipo: this.lezioneToEdit.tipo,
        titolo: this.lezioneToEdit.titolo,
        descrizione: this.lezioneToEdit.descrizione || '',
        dataInizio: dataFormatted,
        oraInizio: oraFormatted,
        durata: this.lezioneToEdit.durata,
        istruttoreId: this.lezioneToEdit.istruttoreId,
        maxPartecipanti: this.lezioneToEdit.maxPartecipanti,
        prezzo: this.lezioneToEdit.prezzo,
        note: this.lezioneToEdit.note || ''
      });

      // Forza il change detection
      this.cdr.detectChanges();
      
      console.log('Form values after setting:', this.form.value);
    }
  }

  private resetForm() {
    this.form.reset();
    this.form.patchValue({
      tipo: TipoLezione.PRIVATA,
      durata: 50,
      maxPartecipanti: 1,
      prezzo: 0
    });
  }

  onSubmit() {
    if (this.form.valid) {
      this.isLoading = true;
      const formData = this.form.value;
      
      // Combina data e ora
      const dataOra = new Date(`${formData.dataInizio}T${formData.oraInizio}`);
      
      const lezione: Partial<ILezione> = {
        tipo: formData.tipo,
        titolo: formData.titolo,
        descrizione: formData.descrizione,
        dataInizio: dataOra,
        dataFine: new Date(dataOra.getTime() + formData.durata * 60000),
        durata: formData.durata,
        istruttoreId: formData.istruttoreId,
        maxPartecipanti: formData.maxPartecipanti,
        partecipantiIscritti: this.lezioneToEdit?.partecipantiIscritti || 0,
        prezzo: formData.prezzo,
        note: formData.note,
        attiva: true
      };

      const operation = this.isEditMode && this.lezioneToEdit?.id
        ? this.lezioniService.updateLezione(this.lezioneToEdit.id, lezione)
        : this.lezioniService.createLezione(lezione as ILezione);

      operation.subscribe({
        next: () => {
          this.toastr.success(
            this.isEditMode ? 'Lezione aggiornata con successo' : 'Lezione creata con successo'
          );
          this.modaleService.chiudi();
        },
        error: (error: any) => {
          console.error('Errore nel salvataggio della lezione:', error);
          this.toastr.error('Errore nel salvataggio della lezione');
          this.isLoading = false;
        },
        complete: () => {
          this.isLoading = false;
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

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

}