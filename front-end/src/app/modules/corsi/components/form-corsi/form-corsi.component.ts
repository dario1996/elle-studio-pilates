import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ModaleService } from '../../../../core/services/modal.service';

@Component({
  selector: 'app-form-corsi',
  templateUrl: './form-corsi.component.html',
  styleUrl: './form-corsi.component.css',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
})
export class FormCorsiComponent implements OnInit {
  @Output() conferma = new EventEmitter<any>();
  form!: FormGroup;
  submitted = false;
  dati: any;

  categorieOpzioni = [
    { value: 'PRIMA_LEZIONE', label: 'Prima Lezione' },
    { value: 'PRIVATA', label: 'Privata' },
    { value: 'SEMI_PRIVATA', label: 'Semi Privata' },
    { value: 'GRUPPO_MAT', label: 'Matwork' },
    { value: 'COMBO', label: 'Combo' },
    { value: 'YOGA', label: 'Yoga' },
  ];

  livelliOpzioni = [
    { value: 'PRINCIPIANTE', label: 'Principiante' },
    { value: 'INTERMEDIO', label: 'Intermedio' },
    { value: 'AVANZATO', label: 'Avanzato' },
    { value: 'TUTTI', label: 'Tutti i livelli' },
  ];

  private modaleService = inject(ModaleService);

  ngOnInit() {
    console.log('FormCorsiComponent ngOnInit, dati:', this.dati);
    this.modaleService.config$.subscribe(config => {
      if (config?.dati) {
        this.dati = config.dati;
        if (this.form) {
          this.form.patchValue({
            nome: this.dati.nome || '',
            descrizione: this.dati.descrizione || '',
            categoria: this.dati.categoria || '',
            livello: this.dati.livello || '',
            durataMinuti: this.dati.durataMinuti || '',
            maxPartecipanti: this.dati.maxPartecipanti || '',
            prezzo: this.dati.prezzo || '',
            attivo: this.dati.attivo !== undefined ? this.dati.attivo : true,
          });
        }
      }
    });
    this.initForm();
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
      descrizione: [
        this.dati?.descrizione || '',
        [Validators.maxLength(500)],
      ],
      categoria: [
        this.dati?.categoria || '',
        [Validators.required],
      ],
      livello: [
        this.dati?.livello || '',
        [Validators.required],
      ],
      durataMinuti: [
        this.dati?.durataMinuti || '',
        [Validators.required, Validators.min(15), Validators.max(180)],
      ],
      maxPartecipanti: [
        this.dati?.maxPartecipanti || '',
        [Validators.required, Validators.min(1), Validators.max(50)],
      ],
      prezzo: [
        this.dati?.prezzo || '',
        [Validators.required, Validators.min(0)],
      ],
      attivo: [
        this.dati?.attivo !== undefined ? this.dati.attivo : true,
      ],
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
