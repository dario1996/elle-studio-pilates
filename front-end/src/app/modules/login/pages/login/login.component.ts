import {
  ActivatedRoute,
  ParamMap,
  Router,
  RouterModule,
} from '@angular/router';
import { Component, effect, signal, OnInit } from '@angular/core';
import { Observable, map, of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

import { AuthJwtService } from '../../../../core/services/authJwt.service';
import { FormsModule } from '@angular/forms';
// import { JumbotronComponent } from '../../../../core/jumbotron/jumbotron.component';
import { SpinnerComponent } from '../../../../core/spinner/spinner.component';
import { CommonModule } from '@angular/common';
import { Ruoli } from '../../../../shared/models/Ruoli';

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

  nologged$: Observable<string | null> = of('');
  expired$: Observable<string | null> = of('');
  registered$: Observable<string | null> = of(''); // Nuovo observable

  errMsg = 'Spiacente, username o password errati! Riprova';
  errMsg2 =
    'Spiacente, devi autenticarti per poter accedere alla pagina selezionata!';
  errMsg3 = "Sessione Scaduta! Eserguire nuovamente l'accesso!";

  constructor(
    private route: Router,
    private activeRoute: ActivatedRoute,
    private Auth: AuthJwtService,
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
}
