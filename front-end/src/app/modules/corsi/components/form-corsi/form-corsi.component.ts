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
import { PiattaformeService } from '../../../../core/services/data/piattaforme.service';
import { IPiattaforma } from '../../../../shared/models/Piattaforma';

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
  piattaforme: IPiattaforma[] = []; // <-- Aggiungi questa riga

  private modaleService = inject(ModaleService);
  private piattaformeService = inject(PiattaformeService);

  ngOnInit() {
    console.log('FormCorsiComponent ngOnInit, dati:', this.dati);
    this.modaleService.config$.subscribe(config => {
      if (config?.dati) {
        this.dati = config.dati;
        if (this.form) {
          this.form.patchValue({
            nome: this.dati.nome || '',
            argomento: this.dati.argomento || '',
            durata: this.dati.durata || '',
            piattaforma: this.dati.piattaforma?.id || '',
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
      argomento: [
        this.dati?.argomento || '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(499),
        ],
      ],
      durata: [this.dati?.durata || '', [Validators.required]],
      piattaforma: [this.dati?.piattaforma?.id || '', [Validators.required]],
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
