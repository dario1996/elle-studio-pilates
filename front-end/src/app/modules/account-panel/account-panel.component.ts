import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { NotificationComponent } from '../../core/notification/notification.component';
import { LoggedUserComponent } from '../../shared/components/logged-user/logged-user.component';
import { PageTitleComponent } from '../../core/page-title/page-title.component';
import { UserService } from '../../core/services/data/user.service';
import { AuthJwtService } from '../../core/services/authJwt.service';
import { RegistrazioneService } from '../../shared/services/registrazione.service';
import { ToastrUniversaleService } from '../../shared/services/toastr-universale.service';
import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-account-panel',
  standalone: true,
  templateUrl: './account-panel.component.html',
  styleUrls: ['./account-panel.component.css'],
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    PageTitleComponent, 
    // NotificationComponent, 
    LoggedUserComponent],
})
export class AccountPanelComponent implements OnInit {
  private userService = inject(UserService);
  private auth = inject(AuthJwtService);
  private fb = inject(FormBuilder);
  private registrazioneService = inject(RegistrazioneService);
  private http = inject(HttpClient);
  private toastr = inject(ToastrUniversaleService);

  title: string = 'Informazioni Account';

  // Modal state
  showPasswordModal = false;
  passwordForm!: FormGroup;
  passwordLoading = false;
  passwordError = '';
  passwordSuccess = '';
  
  // Certificato medico
  uploadingCertificate = false;
  fileName = '';
  selectedFile: File | null = null;

  // Fallback object structure matching DB `utenti` table - real data will override from API
  user: any = {
    id: null,
    username: null,
    email: null,
    nome: null,
    cognome: null,
    codice_fiscale: null,
    indirizzo: null,
    città: null,
    telefono: null,
    certificato_medico: null, // Vecchio campo VARCHAR (retrocompatibilità)
    certificato_medico_nome: null, // Nuovo campo per nome file BLOB
    certificato_medico_data_upload: null, // Nuovo campo per data upload BLOB
    patologie: null,
    descrizione_patologie: null,
    obiettivi: null,
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

  // Verifica se il certificato è presente (controlla il nuovo campo BLOB)
  hasCertificate(): boolean {
    // Prima controlliamo il nuovo campo certificato_medico_nome (BLOB)
    const certNome = this.user.certificato_medico_nome;
    if (certNome !== null && certNome !== undefined && certNome !== '') {
      return true;
    }
    
    // Fallback al vecchio campo per retrocompatibilità
    const cert = this.user.certificato_medico;
    return cert !== null && 
           cert !== undefined && 
           cert !== '' && 
           cert !== '-' && 
           cert !== 'assente' && 
           cert !== 'Assente';
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
          this.user = {
            ...this.user,
            id: u.id || this.user.id, // Usa l'ID numerico, non lo username!
            username: u.username,
            email: u.email,
            nome: u.nome,
            cognome: u.cognome,
            codice_fiscale: u.codiceFiscale || (u as any).codice_fiscale || this.user.codice_fiscale,
            indirizzo: (u as any).indirizzo || this.user.indirizzo,
            città: (u as any).città || this.user.città,
            telefono: (u as any).telefono || this.user.telefono,
            // Campi BLOB per certificato medico
            certificato_medico_nome: (u as any).certificatoMedicoNome || (u as any).certificato_medico_nome || null,
            certificato_medico_data_upload: (u as any).certificatoMedicoDataUpload || (u as any).certificato_medico_data_upload || null,
            // Manteniamo il vecchio campo per retrocompatibilità
            certificato_medico: u.certificatoMedico || (u as any).certificato_medico || this.user.certificato_medico,
            patologie: u.patologie,
            descrizione_patologie: u.descrizionePatologie || (u as any).descrizione_patologie || this.user.descrizione_patologie,
            obiettivi: u.obiettivi,
            attivo: u.attivo,
            data_creazione: u.dataCreazione || (u as any).data_creazione || this.user.data_creazione,
            password: this.user.password,
            ruoli: u.ruoli || [],
          };
          console.log('User data loaded from API:', this.user);
          console.log('Certificato medico nome:', this.user.certificato_medico_nome);
          console.log('Has certificate?', this.hasCertificate());
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

    const userId = this.user?.id;
    if (!userId) {
      this.passwordError = 'Errore: utente non identificato';
      this.passwordLoading = false;
      return;
    }

    const currentPassword = this.passwordForm.get('currentPassword')?.value;
    const newPassword = this.passwordForm.get('newPassword')?.value;

    this.userService.changePassword(userId, currentPassword, newPassword).subscribe({
      next: (response) => {
        this.passwordLoading = false;
        this.passwordSuccess = 'Password cambiata con successo!';
        this.toastr.success('Password cambiata con successo!');
        
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
        
        this.toastr.error(this.passwordError);
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

  // Certificato medico methods
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Validazione: SOLO PDF
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      
      if (!isPdf) {
        this.toastr.error('Sono accettati solo file in formato PDF');
        input.value = '';
        return;
      }
      
      // Validazione dimensione file (max 10MB)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        this.toastr.error('Il file è troppo grande. Dimensione massima: 10MB');
        input.value = '';
        return;
      }
      
      this.selectedFile = file;
      this.fileName = file.name;
      
      // Avvia l'upload automaticamente
      this.uploadCertificate();
    }
  }

  uploadCertificate() {
    if (!this.selectedFile || !this.user.id) {
      this.toastr.error('Errore durante l\'upload del certificato');
      return;
    }

    this.uploadingCertificate = true;
    
    // Usa l'endpoint protetto (utente già autenticato)
    const formData = new FormData();
    formData.append('file', this.selectedFile);
    formData.append('userId', this.user.id.toString());
    
    this.http.post('${environment.apiUrl}/upload/certificato-medico', formData).subscribe({
      next: (response: any) => {
        console.log('Certificato caricato:', response);
        this.uploadingCertificate = false;
        this.toastr.success('Certificato medico caricato con successo!');
        
        // Aggiorna i campi BLOB dell'utente
        this.user.certificato_medico_nome = this.selectedFile?.name || 'certificato.pdf';
        this.user.certificato_medico_data_upload = new Date().toISOString();
        this.user.certificato_medico = 'presente'; // Mantieni per retrocompatibilità
        
        // Reset del file input
        this.selectedFile = null;
        this.fileName = '';
        
        // Reset input file HTML
        const fileInput = document.getElementById('certificateFileInput') as HTMLInputElement;
        if (fileInput) {
          fileInput.value = '';
        }
      },
      error: (error) => {
        console.error('Errore upload certificato:', error);
        this.uploadingCertificate = false;
        this.toastr.error('Errore durante il caricamento del certificato');
        this.selectedFile = null;
        this.fileName = '';
      }
    });
  }

  downloadCertificate() {
    if (!this.user.id) {
      this.toastr.error('Errore durante il download del certificato');
      return;
    }

    this.toastr.info('Download in corso...');
    
    this.http.get(`${environment.apiUrl}/upload/certificato-medico/${this.user.id}`, {
      responseType: 'blob',
      observe: 'response'
    }).subscribe({
      next: (response) => {
        const blob = response.body;
        if (!blob) {
          this.toastr.error('Nessun file trovato');
          return;
        }

        // Estrai il nome del file dall'header Content-Disposition
        const contentDisposition = response.headers.get('Content-Disposition');
        let filename = 'certificato_medico.pdf';
        if (contentDisposition) {
          const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(contentDisposition);
          if (matches != null && matches[1]) {
            filename = matches[1].replace(/['"]/g, '');
          }
        }

        // Crea un link temporaneo per il download
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        this.toastr.success('Certificato scaricato con successo!');
      },
      error: (error) => {
        console.error('Errore download certificato:', error);
        if (error.status === 404) {
          this.toastr.error('Certificato medico non trovato');
        } else {
          this.toastr.error('Errore durante il download del certificato');
        }
      }
    });
  }

  triggerFileUpload() {
    const fileInput = document.getElementById('certificateFileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }
}
