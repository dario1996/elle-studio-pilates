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

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  imports: [
    RouterModule,
    SpinnerComponent,
    FormsModule,
    TranslateModule,
  ],
})
export class LoginComponent implements OnInit {
  titolo = 'Login';
  //sottotitolo = 'Procedi ad inserire la userid e la password';

  userId = '';
  password = '';

  //autenticato : boolean = true;
  autenticato = signal<boolean>(false);
  viewMsg = false;
  notlogged = false;
  expired = false;

  nologged$: Observable<string | null> = of('');
  expired$: Observable<string | null> = of('');

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
  }

  private loggingEffect = effect(() => {
    console.log(`Lo stato di autenticazione è: (${this.autenticato()})`);

    if (this.autenticato()) {
      this.route.navigate(['/gestionale-formazione']);
    }
  });

  gestAuth = () => {
    this.expired = false;
    this.notlogged = false;
    this.viewMsg = false;

    this.Auth.autenticaService(this.userId, this.password).subscribe({
      next: response => {
        console.log('Login effettuato con successo:', response);
        this.autenticato.set(true);
      },
      error: error => {
        console.error('Errore durante il login:', error);
        this.viewMsg = true;
        this.autenticato.set(false);
      },
    });
  };

  annulla() {
    this.userId = '';
    this.password = '';
  }
}
