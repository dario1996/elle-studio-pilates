import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { NotificationComponent } from '../../core/notification/notification.component';
import { LoggedUserComponent } from '../../shared/components/logged-user/logged-user.component';
import { PageTitleComponent } from '../../core/page-title/page-title.component';
import { UserService } from '../../core/services/data/user.service';
import { AuthJwtService } from '../../core/services/authJwt.service';
import { inject } from '@angular/core';

@Component({
  selector: 'app-account-panel',
  standalone: true,
  templateUrl: './account-panel.component.html',
  styleUrls: ['./account-panel.component.css'],
  imports: [CommonModule, ReactiveFormsModule, PageTitleComponent, NotificationComponent, LoggedUserComponent],
})
export class AccountPanelComponent implements OnInit {
  private userService = inject(UserService);
  private auth = inject(AuthJwtService);
  private fb = inject(FormBuilder);

  title: string = 'Informazioni Account';

  // Modal state
  showPasswordModal = false;
  passwordForm!: FormGroup;
  passwordLoading = false;
  passwordError = '';
  passwordSuccess = '';
  
  // Toast notification properties
  showToast = false;
  toastMessage = '';
  toastType: 'success' | 'error' | 'info' = 'success';
  toastIcon = '';
  private toastTimeout?: number;

  // Fallback object structure matching DB `utenti` table - real data will override from API
  user: any = {
    id: null,
    username: null,
    email: null,
    nome: null,
    cognome: null,
    codice_fiscale: null,
    certificato_medico: null,
    patologie: null,
    descrizione_patologie: null,
    obiettivi: null,
    telefono: null,
    azienda: null,
    attivo: null,
    data_creazione: null,
    password: null,
    ruoli: [],
  };

  // display helper: show '-' when value is null/empty/undefined
  display(value: any): string {
    if (value === null || value === undefined || value === '') return '-';
    return String(value);
  }

  // patologie helper: show 'Nessuna' when value is 0, otherwise show content
  displayPatologie(patologie: any): string {
    if (patologie === null || patologie === undefined || patologie === '') return '-';
    if (patologie === 0 || patologie === '0') return 'Nessuna';
    return String(patologie);
  }

  // status helper: normalize attivo field
  displayStatus(attivo: any): string {
    if (attivo === null || attivo === undefined) return '-';
    // possible values in DB may be 'Si'/'No' or '1'/'0' or boolean
    if (attivo === 'Si' || attivo === 'si' || attivo === '1' || attivo === 1 || attivo === true) return 'Attivo';
    return 'Disabilitato';
  }

  ngOnInit(): void {
    this.initPasswordForm();
    
    const username = this.auth.loggedUser();
    if (username) {
      this.userService.getUtenteByUsername(username).subscribe({
        next: (u) => {
          // Handle field mapping between API response and component user object
          this.user = {
            ...this.user,
            id: u.username || this.user.id, // use username as id if no id field
            username: u.username,
            email: u.email,
            nome: u.nome,
            cognome: u.cognome,
            // Handle both camelCase and snake_case from API
            codice_fiscale: u.codiceFiscale || (u as any).codice_fiscale || this.user.codice_fiscale,
            certificato_medico: u.certificatoMedico || (u as any).certificato_medico || this.user.certificato_medico,
            patologie: u.patologie,
            descrizione_patologie: u.descrizionePatologie || (u as any).descrizione_patologie || this.user.descrizione_patologie,
            obiettivi: u.obiettivi,
            telefono: (u as any).telefono || this.user.telefono, // might not be in IUsers interface
            azienda: (u as any).azienda || this.user.azienda, // might not be in IUsers interface
            attivo: u.attivo,
            data_creazione: u.dataCreazione || (u as any).data_creazione || this.user.data_creazione,
            password: this.user.password, // keep hidden
            ruoli: u.ruoli || [],
          };
          console.log('User data loaded from API:', this.user);
        },
        error: (err) => {
          console.warn('Impossibile caricare utente da API, uso dati fallback', err);
        },
      });
    }
  }

  changePassword(): void {
    this.showPasswordModal = true;
    this.passwordForm.reset();
    this.passwordError = '';
    this.passwordSuccess = '';
  }

  closePasswordModal(): void {
    this.showPasswordModal = false;
    this.passwordForm.reset();
    this.passwordError = '';
    this.passwordSuccess = '';
  }

  private initPasswordForm(): void {
    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
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

  // Validator per la complessità della password
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

  // Validator per verificare che le password coincidano
  private passwordMatchValidator() {
    return (group: AbstractControl): ValidationErrors | null => {
      const newPassword = group.get('newPassword')?.value;
      const confirmPassword = group.get('confirmPassword')?.value;
      
      return newPassword === confirmPassword ? null : { passwordMismatch: true };
    };
  }

  onSubmitPasswordChange(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    this.passwordLoading = true;
    this.passwordError = '';
    this.passwordSuccess = '';

    const username = this.auth.loggedUser();
    if (!username) {
      this.passwordError = 'Errore: utente non identificato';
      this.passwordLoading = false;
      return;
    }

    const currentPassword = this.passwordForm.get('currentPassword')?.value;
    const newPassword = this.passwordForm.get('newPassword')?.value;

    this.userService.changePassword(username, currentPassword, newPassword).subscribe({
      next: (response) => {
        this.passwordLoading = false;
        this.passwordSuccess = 'Password cambiata con successo!';
        this.showToastMessage('Password cambiata con successo!', 'success');
        
        // Chiudi il modal dopo 2 secondi
        setTimeout(() => {
          this.closePasswordModal();
        }, 2000);
      },
      error: (error) => {
        this.passwordLoading = false;
        console.error('Errore cambio password:', error);
        
        if (error.status === 401 || error.status === 400) {
          this.passwordError = 'Password corrente non valida';
        } else if (error.status === 422) {
          this.passwordError = 'La nuova password non rispetta i requisiti di sicurezza';
        } else {
          this.passwordError = 'Errore durante il cambio password. Riprova più tardi.';
        }
        
        this.showToastMessage(this.passwordError, 'error');
      }
    });
  }

  // Metodi per visualizzare i requisiti della password con stato
  getPasswordRequirements(): Array<{ text: string; valid: boolean }> {
    const newPasswordControl = this.passwordForm.get('newPassword');
    const value = newPasswordControl?.value || '';
    
    // Se il campo non è stato toccato, mostra tutti i requisiti come non validi
    const touched = newPasswordControl?.touched || false;
    
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

  // Verifica se tutti i requisiti sono soddisfatti
  areAllRequirementsMet(): boolean {
    return this.getPasswordRequirements().every(req => req.valid);
  }

  hasPasswordMismatch(): boolean {
    return this.passwordForm.hasError('passwordMismatch') && 
           this.passwordForm.get('confirmPassword')?.touched || false;
  }

  // Toast notification methods
  showToastMessage(message: string, type: 'success' | 'error' | 'info' = 'success') {
    this.toastMessage = message;
    this.toastType = type;
    this.toastIcon = type === 'success' ? 'success' : type === 'error' ? 'error' : 'info';
    this.showToast = true;
    
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
    this.toastTimeout = window.setTimeout(() => {
      this.hideToast();
    }, 3000);
  }
  
  hideToast() {
    this.showToast = false;
    if (this.toastTimeout) {
      clearTimeout(this.toastTimeout);
    }
  }
}
