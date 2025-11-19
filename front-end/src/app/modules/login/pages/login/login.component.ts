import {
  ActivatedRoute,
  ParamMap,
  Router,
  RouterModule,
} from '@angular/router';
import { Component, effect, signal, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

import { AuthJwtService } from '../../../../core/services/authJwt.service';
import { FormsModule } from '@angular/forms';
// import { JumbotronComponent } from '../../../../core/jumbotron/jumbotron.component';
import { SpinnerComponent } from '../../../../core/spinner/spinner.component';
import { CommonModule } from '@angular/common';
import { Ruoli } from '../../../../shared/models/Ruoli';
import { ModaleService } from '../../../../core/services/modal.service';
import { PasswordResetComponent } from '../../../password-reset/components/password-reset-content/password-reset';
import { PasswordResetFormComponent } from '../../../password-reset/components/password-reset-form/password-reset-form.component';
import { PasswordResetService } from '../../../../shared/services/password-reset.service';
import { ToastrUniversaleService } from '../../../../shared/services/toastr-universale.service';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  imports: [
    RouterModule,
    FormsModule,
    TranslateModule,
    CommonModule
  ],
})
export class LoginComponent implements OnInit {
  titolo = 'Login';
  //sottotitolo = 'Procedi ad inserire la userid e la password';

  userId = '';
  password = '';
  showPassword = false;

  //autenticato : boolean = true;
  autenticato = signal<boolean>(false);
  viewMsg = false;
  notlogged = false;
  expired = false;
  registered = false; // Nuovo flag per registrazione completata
  
  // Riferimento al componente password reset form
  private passwordResetFormComponent: any = null;

  nologged$: Observable<string | null> = of('');
  expired$: Observable<string | null> = of('');
  registered$: Observable<string | null> = of(''); // Nuovo observable
  token$: Observable<string | null> = of(''); // Observable per il token

  errMsg = 'Spiacente, username o password errati! Riprova';
  errMsg2 =
    'Spiacente, devi autenticarti per poter accedere alla pagina selezionata!';
  errMsg3 = "Sessione Scaduta! Eserguire nuovamente l'accesso!";

  constructor(
    private route: Router,
    private activeRoute: ActivatedRoute,
    private Auth: AuthJwtService,
    private modaleService: ModaleService,
    private passwordResetService: PasswordResetService,
    private toastr: ToastrUniversaleService
  ) {}

  ngOnInit(): void {
    this.nologged$ = this.activeRoute.queryParamMap.pipe(
      map((params: ParamMap) => params.get('nologged')),
    );
    this.nologged$.subscribe(param =>
      param ? (this.notlogged = true) : (this.notlogged = false),
    );

    this.expired$ = this.activeRoute.queryParamMap.pipe(
      map((params: ParamMap) => params.get('expired')),
    );
    this.expired$.subscribe(param =>
      param ? (this.expired = true) : (this.expired = false),
    );

    this.registered$ = this.activeRoute.queryParamMap.pipe(
      map((params: ParamMap) => params.get('registered')),
    );
    this.registered$.subscribe(param =>
      param ? (this.registered = true) : (this.registered = false),
    );

    // Controlla se c'è un token per il reset password
    this.token$ = this.activeRoute.queryParamMap.pipe(
      map((params: ParamMap) => params.get('token')),
    );
    this.token$.subscribe(token => {
      if (token) {
        this.openPasswordResetFormModal(token);
      }
    });
  }

  private loggingEffect = effect(() => {
    console.log(`Lo stato di autenticazione è: (${this.autenticato()})`);

    if (this.autenticato()) {
      this.redirectBasedOnRole();
    }
  });

  private redirectBasedOnRole(): void {
    const authorities = this.Auth.getUserRoles();
    
    console.log('Authorities trovate:', authorities);

    if (authorities.includes(Ruoli.amministratore) || authorities.includes(Ruoli.utente)) {
      console.log('Redirect per utente autenticato');
      this.route.navigate(['/gestionale-elle-studio']);
    } else {
      console.error('Ruolo non riconosciuto:', authorities);
      this.route.navigate(['/forbidden']);
    }
  }

  gestAuth = () => {
    this.expired = false;
    this.notlogged = false;
    this.registered = false; // Nascondi il toast quando l'utente tenta il login
    this.viewMsg = false;

    this.Auth.autenticaService(this.userId, this.password).subscribe({
      next: response => {
        console.log('Login effettuato con successo:', response);
        
        // Verifica se ci sono errori nella risposta
        if (response.errorCode) {
          // Gestisci i diversi tipi di errore
          if (response.errorCode === 'ACCOUNT_DISABLED') {
            this.errMsg = response.errorMessage || 'Il tuo account non è ancora stato attivato. Contatta l\'amministratore.';
          } else if (response.errorCode === 'INVALID_CREDENTIALS') {
            this.errMsg = response.errorMessage || 'Username o password errati. Riprova.';
          } else {
            this.errMsg = response.errorMessage || 'Errore durante il login. Riprova.';
          }
          this.viewMsg = true;
          this.autenticato.set(false);
        } else {
          // Login riuscito
          this.autenticato.set(true);
        }
      },
      error: error => {
        console.error('Errore durante il login:', error);
        
        // Gestione errori HTTP
        if (error.status === 403 && error.error?.errorCode) {
          if (error.error.errorCode === 'ACCOUNT_DISABLED') {
            this.errMsg = 'Il tuo account non è ancora stato attivato. Contatta l\'amministratore.';
          } else if (error.error.errorCode === 'INVALID_CREDENTIALS') {
            this.errMsg = 'Username o password errati. Riprova.';
          } else {
            this.errMsg = error.error.errorMessage || 'Errore durante il login. Riprova.';
          }
        } else {
          this.errMsg = 'Errore di connessione. Riprova più tardi.';
        }
        
        this.viewMsg = true;
        this.autenticato.set(false);
      },
    });
  };

  annulla() {
    this.userId = '';
    this.password = '';
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  openPasswordResetModal() {
    this.modaleService.apri({
      titolo: 'Reimposta Password',
      componente: PasswordResetComponent,
      dimensione: 'md',
      showCloseButton: true,
      showDefaultButtons: false,
      customButtons: [
        {
          text: 'Annulla',
          cssClass: 'btn-cancel',
          action: () => {
            this.modaleService.chiudi();
          }
        },
        {
          text: 'Invia',
          cssClass: 'btn-confirm',
          disabled: false,
          loading: false,
          action: () => {
            this.handlePasswordResetSubmit();
          }
        }
      ]
    });
  }

  handlePasswordResetSubmit() {
    // Ottieni il riferimento al componente PasswordReset
    const modalConfig = this.modaleService['configSubject'].value;
    
    if (modalConfig && modalConfig.customButtons && modalConfig.customButtons.length > 1) {
      // Disabilita il pulsante e mostra loading
      modalConfig.customButtons[1].loading = true;
      modalConfig.customButtons[1].disabled = true;
    }

    // Recupera l'email dal componente (questo richiederà un'implementazione nel modal)
    // Per ora simuliamo
    const email = (document.getElementById('resetEmail') as HTMLInputElement)?.value;
    
    if (!email || !email.includes('@')) {
      alert('Inserisci un\'email valida');
      if (modalConfig && modalConfig.customButtons && modalConfig.customButtons.length > 1) {
        modalConfig.customButtons[1].loading = false;
        modalConfig.customButtons[1].disabled = false;
      }
      return;
    }

    this.passwordResetService.requestPasswordReset(email).subscribe({
      next: (response) => {
        console.log('Email inviata con successo:', response);
        
        // Mostra messaggio di successo
        this.modaleService.chiudi();
        
        // Mostra toast di successo
        this.toastr.success(
          'Controlla la tua casella di posta per il link di reset password',
          'Email inviata!',
          { duration: 6000 }
        );
      },
      error: (error) => {
        console.error('Errore invio email:', error);
        
        // Mostra toast di errore
        this.toastr.error(
          error.error?.message || 'Errore durante l\'invio. Riprova più tardi.',
          'Errore invio email'
        );
        
        // Riabilita il pulsante
        if (modalConfig && modalConfig.customButtons && modalConfig.customButtons.length > 1) {
          modalConfig.customButtons[1].loading = false;
          modalConfig.customButtons[1].disabled = false;
        }
      }
    });
  }

  openPasswordResetFormModal(token: string) {
    // Prima valida il token
    this.passwordResetService.validateResetToken(token).subscribe({
      next: (response) => {
        if (response.valid) {
          // Salva il token e lo username temporaneamente
          sessionStorage.setItem('resetToken', token);
          sessionStorage.setItem('resetUsername', response.username || '');
          
          this.modaleService.apri({
            titolo: 'Imposta Nuova Password',
            componente: PasswordResetFormComponent,
            dimensione: 'md',
            showCloseButton: true,
            showDefaultButtons: false,
            customButtons: [
              {
                text: 'Annulla',
                cssClass: 'btn-cancel',
                action: () => {
                  sessionStorage.removeItem('resetToken');
                  sessionStorage.removeItem('resetUsername');
                  this.modaleService.chiudi();
                  // Rimuovi il token dall'URL
                  this.route.navigate(['/login']);
                }
              },
              {
                text: 'Conferma',
                cssClass: 'btn-confirm',
                disabled: false,
                loading: false,
                action: () => {
                  this.handlePasswordResetFormSubmit();
                }
              }
            ]
          });
        } else {
          this.toastr.warning(
            'Il link è scaduto o non valido. Richiedi un nuovo reset password.',
            'Link non valido'
          );
          this.route.navigate(['/login']);
        }
      },
      error: (error) => {
        console.error('Errore validazione token:', error);
        this.toastr.error(
          'Il link è scaduto o non valido. Richiedi un nuovo reset password.',
          'Errore validazione'
        );
        this.route.navigate(['/login']);
      }
    });
  }

  handlePasswordResetFormSubmit() {
    // Recupera il componente dal window object
    const componentInstance = (window as any).passwordResetFormComponent;
    
    if (componentInstance && typeof componentInstance.submitForm === 'function') {
      // Controlla se il form è valido
      if (componentInstance.isFormValid()) {
        const modalConfig = this.modaleService['configSubject'].value;
        
        if (modalConfig && modalConfig.customButtons && modalConfig.customButtons.length > 1) {
          modalConfig.customButtons[1].loading = true;
          modalConfig.customButtons[1].disabled = true;
        }
        
        // Chiama il metodo di submit del componente
        componentInstance.submitForm();
      } else {
        // Marca tutti i campi come touched per mostrare gli errori
        componentInstance.passwordForm.markAllAsTouched();
      }
    }
  }
}

