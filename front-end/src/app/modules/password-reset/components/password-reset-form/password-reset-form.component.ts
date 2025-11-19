import { Component, EventEmitter, Input, OnInit, OnDestroy, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { PasswordResetService } from '../../../../shared/services/password-reset.service';
import { ToastrUniversaleService } from '../../../../shared/services/toastr-universale.service';

@Component({
  selector: 'app-password-reset-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './password-reset-form.component.html',
  styleUrl: './password-reset-form.component.css'
})
export class PasswordResetFormComponent implements OnInit, OnDestroy {
  @Output() success = new EventEmitter<void>();
  @Output() error = new EventEmitter<string>();

  token: string = '';
  username: string = '';
  passwordForm!: FormGroup;
  isLoading = false;
  showSuccess = false;
  showError = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private passwordResetService: PasswordResetService,
    private toastr: ToastrUniversaleService
  ) {}

  ngOnInit(): void {
    // Recupera il token e username da sessionStorage
    this.token = sessionStorage.getItem('resetToken') || '';
    this.username = sessionStorage.getItem('resetUsername') || '';
    this.initPasswordForm();
    
    // Registra questo componente globalmente per accesso dal LoginComponent
    (window as any).passwordResetFormComponent = this;
  }

  private initPasswordForm(): void {
    this.passwordForm = this.fb.group({
      newPassword: ['', [
        Validators.required,
        Validators.minLength(8),
        this.passwordStrengthValidator()
      ]],
      confirmPassword: ['', [Validators.required]]
    }, {
      validators: this.passwordMatchValidator()
    });
  }

  private passwordStrengthValidator() {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      if (!value) return null;

      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasNumeric = /[0-9]/.test(value);
      const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);

      const passwordValid = hasUpperCase && hasLowerCase && hasNumeric && hasSpecialChar;

      return !passwordValid ? {
        passwordStrength: {
          hasUpperCase,
          hasLowerCase,
          hasNumeric,
          hasSpecialChar
        }
      } : null;
    };
  }

  private passwordMatchValidator() {
    return (group: AbstractControl): ValidationErrors | null => {
      const newPassword = group.get('newPassword')?.value;
      const confirmPassword = group.get('confirmPassword')?.value;
      
      return newPassword === confirmPassword ? null : { passwordMismatch: true };
    };
  }

  hasPasswordMismatch(): boolean {
    const confirmControl = this.passwordForm.get('confirmPassword');
    return !!(confirmControl?.touched && this.passwordForm.hasError('passwordMismatch'));
  }

  getPasswordRequirements(): Array<{ text: string; valid: boolean }> {
    const newPasswordControl = this.passwordForm.get('newPassword');
    const value = newPasswordControl?.value || '';
    
    const requirements = [
      {
        text: 'Minimo 8 caratteri',
        valid: value.length >= 8
      },
      {
        text: 'Almeno una lettera maiuscola (A-Z)',
        valid: /[A-Z]/.test(value)
      },
      {
        text: 'Almeno una lettera minuscola (a-z)',
        valid: /[a-z]/.test(value)
      },
      {
        text: 'Almeno un numero (0-9)',
        valid: /[0-9]/.test(value)
      },
      {
        text: 'Almeno un carattere speciale (!@#$%^&*)',
        valid: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value)
      }
    ];
    
    return requirements;
  }

  onSubmit(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.showError = false;
    this.showSuccess = false;

    const newPassword = this.passwordForm.get('newPassword')?.value;

    this.passwordResetService.resetPassword(this.token, newPassword).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.showSuccess = true;
        sessionStorage.removeItem('resetToken');
        sessionStorage.removeItem('resetUsername');
        this.success.emit();
        
        // Mostra toast di successo
        this.toastr.success(
          'Ora puoi effettuare il login con la nuova password',
          'Password aggiornata!',
          { duration: 6000 }
        );
        
        // Chiudi il modal dopo 2 secondi e redirect al login
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      },
      error: (error) => {
        this.isLoading = false;
        this.showError = true;
        this.errorMessage = error.error?.message || 'Errore durante il reset della password. Riprova più tardi.';
        this.error.emit(this.errorMessage);
        
        // Mostra toast di errore
        this.toastr.error(
          this.errorMessage,
          'Errore reset password'
        );
      }
    });
  }

  // Metodo pubblico per triggare il submit da fuori
  public submitForm(): void {
    this.onSubmit();
  }

  // Metodo pubblico per verificare se il form è valido
  public isFormValid(): boolean {
    return this.passwordForm.valid;
  }

  ngOnDestroy(): void {
    // Rimuovi il riferimento globale
    delete (window as any).passwordResetFormComponent;
  }
}
