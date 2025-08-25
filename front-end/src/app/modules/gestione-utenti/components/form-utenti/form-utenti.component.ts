import { Component, OnInit, Output, EventEmitter, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IUsers } from '../../../../shared/models/Users';
import { ModaleService } from '../../../../core/services/modal.service';

@Component({
  selector: 'app-form-utenti',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-utenti.component.html',
  styleUrls: ['./form-utenti.component.css']
})
export class FormUtentiComponent implements OnInit {
  @Output() conferma = new EventEmitter<any>();
  
  utenteForm!: FormGroup;
  submitted = false;
  dati: IUsers | null = null;
  isEditMode = false;

  private modaleService = inject(ModaleService);

  ruoliDisponibili = [
    { value: 'utente', label: 'Utente' },
    { value: 'amministratore', label: 'Amministratore' }
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.modaleService.config$.subscribe(config => {
      if (config?.dati) {
        this.dati = config.dati;
        this.isEditMode = !!this.dati && !!this.dati.username;
        if (this.utenteForm) {
          this.patchFormValues();
        }
      }
    });
    this.initForm();
  }

  initForm(): void {
    this.utenteForm = this.fb.group({
      username: [
        this.dati?.username || '',
        [Validators.required, Validators.minLength(3)]
      ],
      email: [
        this.dati?.email || '',
        [Validators.required, Validators.email]
      ],
      nome: [
        this.dati?.nome || '',
        [Validators.required]
      ],
      cognome: [
        this.dati?.cognome || '',
        [Validators.required]
      ],
      codiceFiscale: [
        this.dati?.codiceFiscale || ''
      ],
      certificatoMedico: [
        this.dati?.certificatoMedico || false
      ],
      ruoli: [
        this.dati?.ruoli || ['utente'],
        [Validators.required]
      ],
      patologie: [
        this.dati?.patologie || false
      ],
      descrizionePatologie: [
        this.dati?.descrizionePatologie || ''
      ],
      obiettivi: [
        this.dati?.obiettivi || ''
      ]
    });
  }

  private patchFormValues(): void {
    this.utenteForm.patchValue({
      username: this.dati?.username || '',
      email: this.dati?.email || '',
      nome: this.dati?.nome || '',
      cognome: this.dati?.cognome || '',
      codiceFiscale: this.dati?.codiceFiscale || '',
      certificatoMedico: this.dati?.certificatoMedico || false,
      ruoli: this.dati?.ruoli || ['utente'],
      patologie: this.dati?.patologie || false,
      descrizionePatologie: this.dati?.descrizionePatologie || '',
      obiettivi: this.dati?.obiettivi || ''
    });
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.utenteForm.invalid) {
      return;
    }
    this.conferma.emit(this.utenteForm.value);
  }

  confermaForm(): void {
    this.onSubmit();
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.utenteForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched || this.submitted));
  }

  getFieldErrorMessage(fieldName: string): string {
    const field = this.utenteForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${fieldName} è obbligatorio`;
      if (field.errors['email']) return 'Email non valida';
      if (field.errors['minlength']) return `${fieldName} troppo corto`;
      if (field.errors['maxlength']) return `${fieldName} troppo lungo`;
    }
    return '';
  }
}
