import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ModaleService } from '../../../../core/services/modal.service';

@Component({
  selector: 'app-form-modifica-assegnazione',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-modifica-assegnazione.component.html',
  styleUrls: ['./form-modifica-assegnazione.component.css']
})
export class FormModificaAssegnazioneComponent implements OnInit {
  @Output() conferma = new EventEmitter<any>();  // ✅ CORRETTO: conferma (come form-corsi)
  form!: FormGroup;
  submitted = false;
  dati: any;

  private modaleService = inject(ModaleService);

  statiDisponibili = [
    { value: 'DA_INIZIARE', label: 'Da iniziare' },
    { value: 'IN_CORSO', label: 'In corso' },
    { value: 'TERMINATO', label: 'Terminato' },
    { value: 'INTERROTTO', label: 'Interrotto' }
  ];

  ngOnInit() {
    console.log('FormModificaAssegnazioneComponent ngOnInit');
    
    this.modaleService.config$.subscribe(config => {
      if (config?.dati) {
        this.dati = config.dati;
        console.log('Dati ricevuti dal modale:', this.dati);
        
        if (this.form) {
          this.form.patchValue({
            dataAssegnazione: this.formatDateForInput(this.dati.dataAssegnazione),
            impattoIsms: this.dati.impattoIsms || false,
            stato: this.mapStatoFromDisplay(this.dati.statoDisplay) || 'DA_INIZIARE',
            percentualeCompletamento: this.dati.percentualeCompletamento || 0,
            dataTerminePrevista: this.formatDateForInput(this.dati.dataTerminePrevista),
            dataInizio: this.formatDateForInput(this.dati.dataInizio),
            dataCompletamento: this.formatDateForInput(this.dati.dataCompletamento),
            esito: this.dati.esito || '',
            attestato: this.dati.attestato || false
          });
        }
      }
    });
    
    this.initForm();
  }

  initForm() {
    this.form = new FormBuilder().group({
      dataAssegnazione: [
        this.formatDateForInput(this.dati?.dataAssegnazione),
        []
      ],
      impattoIsms: [
        this.dati?.impattoIsms || false,
        []
      ],
      stato: [
        this.mapStatoFromDisplay(this.dati?.statoDisplay) || 'DA_INIZIARE',
        [Validators.required]
      ],
      percentualeCompletamento: [
        this.dati?.percentualeCompletamento || 0,
        [Validators.min(0), Validators.max(100)]
      ],
      dataTerminePrevista: [
        this.formatDateForInput(this.dati?.dataTerminePrevista),
        []
      ],
      dataInizio: [
        this.formatDateForInput(this.dati?.dataInizio),
        []
      ],
      dataCompletamento: [
        this.formatDateForInput(this.dati?.dataCompletamento),
        []
      ],
      esito: [
        this.dati?.esito || '',
        []
      ],
      attestato: [
        this.dati?.attestato || false,
        []
      ]
    });
  }

  mapStatoFromDisplay(statoDisplay: string): string {
    const mappingStato: { [key: string]: string } = {
      'Da iniziare': 'DA_INIZIARE',
      'In corso': 'IN_CORSO', 
      'Terminato': 'TERMINATO',
      'Interrotto': 'INTERROTTO'
    };
    return mappingStato[statoDisplay] || 'DA_INIZIARE';
  }

  private formatDateForInput(dateValue: any): string {
    if (!dateValue) return '';
    try {
      const date = new Date(dateValue);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().split('T')[0];
    } catch {
      return '';
    }
  }

  onSubmit() {
    this.submitted = true;
    if (this.form.invalid) {
      console.log('Form non valido:', this.form.errors);
      return;
    }
    console.log('Form valido, emetto conferma:', this.form.value);
    this.conferma.emit(this.form.value);  // ✅ CORRETTO: conferma.emit (come form-corsi)
  }

  confermaForm() {  // ✅ CORRETTO: confermaForm (come form-corsi)
    this.onSubmit();
  }
}