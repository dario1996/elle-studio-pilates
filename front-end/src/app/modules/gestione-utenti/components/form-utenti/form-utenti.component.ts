import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IUsers } from '../../../../shared/models/Users';

@Component({
  selector: 'app-form-utenti',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-utenti.component.html',
  styleUrls: ['./form-utenti.component.css']
})
export class FormUtentiComponent implements OnInit {
  @Input() utente: IUsers | null = null;
  @Output() conferma = new EventEmitter<IUsers>();
  @Output() annulla = new EventEmitter<void>();

  utenteForm: FormGroup;
  isEditMode = false;
  showPassword = false;
  showConfirmPassword = false;

  ruoliDisponibili = [
    { value: 'utente', label: 'Utente' },
    { value: 'amministratore', label: 'Amministratore' }
  ];

  constructor(private fb: FormBuilder) {
    this.utenteForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      nome: ['', Validators.required],
      cognome: ['', Validators.required],
      codiceFiscale: [''],
      ruoli: [['utente'], Validators.required],
      attivo: ['Si', Validators.required],
      patologie: [false],
      descrizionePatologie: [''],
      obiettivi: ['']
    }, { 
      validators: this.passwordMatchValidator 
    });
  }

  ngOnInit(): void {
    if (this.utente) {
      this.isEditMode = true;
      this.setupEditMode();
    }
  }

  private setupEditMode(): void {
    if (this.utente) {
      // In modalità edit, la password non è obbligatoria
      this.utenteForm.get('password')?.clearValidators();
      this.utenteForm.get('confirmPassword')?.clearValidators();
      this.utenteForm.get('username')?.disable(); // Username non modificabile
      
      this.utenteForm.patchValue({
        username: this.utente.username,
        email: this.utente.email,
        nome: this.utente.nome || '',
        cognome: this.utente.cognome || '',
        codiceFiscale: this.utente.codiceFiscale || '',
        ruoli: Array.isArray(this.utente.ruoli) ? this.utente.ruoli : [this.utente.ruoli || 'utente'],
        attivo: this.utente.attivo || 'Si',
        patologie: this.utente.patologie || false,
        descrizionePatologie: this.utente.descrizionePatologie || '',
        obiettivi: this.utente.obiettivi || ''
      });
    }
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      if (confirmPassword?.errors?.['passwordMismatch']) {
        delete confirmPassword.errors['passwordMismatch'];
        if (Object.keys(confirmPassword.errors).length === 0) {
          confirmPassword.setErrors(null);
        }
      }
    }
    return null;
  }

  onSubmit(): void {
    if (this.utenteForm.valid) {
      const formValue = this.utenteForm.getRawValue(); // getRawValue per includere campi disabilitati
      
      // Se è edit mode e la password è vuota, non includerla
      if (this.isEditMode && !formValue.password) {
        delete formValue.password;
        delete formValue.confirmPassword;
      }
      
      this.conferma.emit(formValue);
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.annulla.emit();
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  private markFormGroupTouched(): void {
    Object.keys(this.utenteForm.controls).forEach(key => {
      const control = this.utenteForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.utenteForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldErrorMessage(fieldName: string): string {
    const field = this.utenteForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${fieldName} è obbligatorio`;
      if (field.errors['email']) return 'Email non valida';
      if (field.errors['minlength']) return `${fieldName} troppo corto`;
      if (field.errors['passwordMismatch']) return 'Le password non coincidono';
    }
    return '';
  }
}
