import { CommonModule } from '@angular/common';
import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PiattaformeService } from '../../../../core/services/data/piattaforme.service';
import { ModaleService } from '../../../../core/services/modal.service';

@Component({
  selector: 'app-form-piattaforme',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  standalone: true,
  templateUrl: './form-piattaforme.component.html',
  styleUrl: './form-piattaforme.component.css',
})
export class FormPiattaformeComponent {
  @Output() conferma = new EventEmitter<any>();
  form!: FormGroup;
  submitted = false;
  dati: any;

  private modaleService = inject(ModaleService);

  ngOnInit() {
    this.initForm();
    this.modaleService.config$.subscribe(config => {
      if (config?.dati) {
        this.dati = config.dati;
        this.form.patchValue({
          nome: this.dati.nome || '',
          descrizione: this.dati.descrizione || '',
          urlSito: this.dati.urlSito || '',
          attiva:
            this.dati.attiva === true || this.dati.attiva === 'Attivo' || this.dati.attiva === 'true'
              ? 'true'
              : 'false',
        });
      }
    });
  }

  initForm() {
    this.form = new FormBuilder().group({
      nome: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(99),
        ],
      ],
      descrizione: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(499),
        ],
      ],
      urlSito: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.maxLength(254),
        ],
      ],
      attiva: ['', [Validators.required]],
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
