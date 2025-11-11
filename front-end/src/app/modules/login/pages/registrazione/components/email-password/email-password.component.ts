import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, ChangeDetectorRef } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-email-password',
  templateUrl: './email-password.component.html',
  styleUrl: './email-password.component.css',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule]
})
export class EmailPasswordComponent implements OnInit {
  @Input() initialData: any = {};
  @Input() isSubmitting: boolean = false;
  @Output() continua = new EventEmitter<any>();
  @Output() indietro = new EventEmitter<void>();

  emailForm: FormGroup;
  showPassword = false;
  showConfirm = false;
  
  // Stato del popup requisiti password
  showPasswordRequirements = false;
  passwordFocused = false;
  
  // Cache dei requisiti per evitare problemi di rendering
  passwordRequirements: Array<{ text: string; valid: boolean }> = [];

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {
    this.emailForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, this.passwordStrengthValidator()]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator() });
  }

  ngOnInit() {
    if (this.initialData) {
      this.emailForm.patchValue(this.initialData);
    }
    
    // Inizializza i requisiti
    this.updatePasswordRequirements();
    
    // Monitora i cambiamenti della password
    this.emailForm.get('password')?.valueChanges.subscribe(() => {
      this.updatePasswordRequirements();
    });
  }

  onPasswordFocus() {
    this.passwordFocused = true;
    this.showPasswordRequirements = true;
    this.updatePasswordRequirements();
  }

  onPasswordBlur() {
    this.passwordFocused = false;
    // Mantieni il popup visibile per un momento prima di nasconderlo
    setTimeout(() => {
      if (!this.passwordFocused) {
        this.showPasswordRequirements = false;
      }
    }, 200);
  }
  
  // Aggiorna i requisiti della password
  updatePasswordRequirements() {
    const password = this.emailForm.get('password')?.value || '';
    
    this.passwordRequirements = [
      {
        text: 'Almeno 8 caratteri',
        valid: password.length >= 8
      },
      {
        text: 'Una lettera maiuscola',
        valid: /[A-Z]/.test(password)
      },
      {
        text: 'Una lettera minuscola',
        valid: /[a-z]/.test(password)
      },
      {
        text: 'Un numero',
        valid: /\d/.test(password)
      },
      {
        text: 'Un carattere speciale (!@#$%^&*...)',
        valid: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
      }
    ];
    
    this.cdr.detectChanges();
  }

  // Validator per la complessità della password
  passwordStrengthValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = control.value;
      
      if (!value) {
        return null;
      }

      const hasMinLength = value.length >= 8;
      const hasUpperCase = /[A-Z]/.test(value);
      const hasLowerCase = /[a-z]/.test(value);
      const hasNumber = /\d/.test(value);
      const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value);

      const passwordValid = hasMinLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar;

      return !passwordValid ? { passwordStrength: true } : null;
    };
  }

  // Validator per verificare che le password coincidano
  passwordMatchValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.get('password');
      const confirmPassword = control.get('confirmPassword');

      if (!password || !confirmPassword) {
        return null;
      }

      return password.value === confirmPassword.value ? null : { passwordMismatch: true };
    };
  }

  // Metodi per visualizzare i requisiti della password con stato
  getPasswordRequirements(): Array<{ text: string; valid: boolean }> {
    return this.passwordRequirements;
  }

  // Verifica se tutti i requisiti sono soddisfatti
  areAllRequirementsMet(): boolean {
    return this.passwordRequirements.every(req => req.valid);
  }

  onSubmit() {
    if (this.emailForm.valid) {
      this.continua.emit(this.emailForm.value);
    } else {
      this.emailForm.markAllAsTouched();
    }
  }
}
