import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PiattaformeService } from '../../../../core/services/data/piattaforme.service';
import { ModaleService } from '../../../../core/services/modal.service';
import { IPiattaforma } from '../../../../shared/models/Piattaforma';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-form-dipendenti',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './form-dipendenti.component.html',
  styleUrl: './form-dipendenti.component.css',
})
export class FormDipendentiComponent {
  @Output() conferma = new EventEmitter<any>();
  form!: FormGroup;
  submitted = false;
  dati: any;
  piattaforme: IPiattaforma[] = []; // <-- Aggiungi questa riga

  private modaleService = inject(ModaleService);
  private piattaformeService = inject(PiattaformeService);

  ngOnInit() {
    console.log('FormDipendentiComponent ngOnInit, dati:', this.dati);
    this.modaleService.config$.subscribe(config => {
      if (config?.dati) {
        this.dati = config.dati;
        if (this.form) {
          this.form.patchValue({
            nome: this.dati.nome || '',
            cognome: this.dati.cognome || '',
            email: this.dati.email || '',
            codiceDipendente: this.dati.codiceDipendente || '',
            reparto: this.dati.reparto || '',
            commerciale: this.dati.commerciale || '',
            azienda: this.dati.azienda || '',
            ruolo: this.dati.ruolo || '',
            isms: this.dati.isms || '',
            sede: this.dati.sede || '',
            community: this.dati.community || '',
            responsabile: this.dati.responsabile || '',
          });
        }
      }
    });
    this.initForm();
    this.piattaformeService.getListaPiattaforme().subscribe({
      next: data => (this.piattaforme = data),
    });
  }

  initForm() {
    this.form = new FormBuilder().group({
      nome: [
        this.dati?.nome || '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(99),
        ],
      ],
      cognome: [
        this.dati?.cognome || '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(99),
        ],
      ],
      email: [
        this.dati?.email || '',
        [
          Validators.required,
          Validators.email,
        ],
      ],
      codiceDipendente: [
        this.dati?.codiceDipendente || '',
        [
          Validators.required,
          Validators.maxLength(50),
        ],
      ],
      reparto: [
        this.dati?.reparto || '',
        [
          Validators.maxLength(100),
        ],
      ],
      commerciale: [
        this.dati?.commerciale || '',
        [
          Validators.maxLength(100),
        ],
      ],
      azienda: [
        this.dati?.azienda || '',
        [
          Validators.maxLength(100),
        ],
      ],
      ruolo: [
        this.dati?.ruolo || '',
        [
          Validators.maxLength(100),
        ],
      ],
      // New fields - optional, will be null if not provided
      isms: [this.dati?.isms || ''],
      sede: [this.dati?.sede || ''],
      community: [this.dati?.community || ''],
      responsabile: [this.dati?.responsabile || ''],
    });
  }

  onSubmit() {
    this.submitted = true;
    if (this.form.invalid) {
      return;
    }
    this.conferma.emit(this.form.value);
  }

  trackById(index: number, item: any) {
    return item.id;
  }

  confermaForm() {
    this.onSubmit();
  }
}
