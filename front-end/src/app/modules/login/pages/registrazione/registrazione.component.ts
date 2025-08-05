/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { IUsers } from '../../../../shared/models/Users';
import { UserService } from '../../../../core/services/data/user.service';
import { ApiMsg } from '../../../../shared/models/ApiMsg';
import { RouterModule } from '@angular/router';
import { LoadingService } from '../../../../core/services/loading.service';
import { DettagliProfiloComponent } from './components/dettagli-profilo/dettagli-profilo.component';
import { CertificatoMedicoComponent } from './components/certificato-medico/certificato-medico.component';
import { EmailPasswordComponent } from "./components/email-password/email-password.component";

@Component({
  selector: 'app-registrazione',
  standalone: true,
  templateUrl: './registrazione.component.html',
  styleUrl: './registrazione.component.css',
  imports: [
    CommonModule,
    RouterModule,
    DettagliProfiloComponent,
    CertificatoMedicoComponent,
    EmailPasswordComponent
],
})
export class RegistrazioneComponent implements OnInit {
  titolo = 'Signup';

  utente: IUsers = {
    username: '',
    email: '',
    cellulare: '',
    password: '',
    attivo: '',
    flagPrivacy: '',
    ruoli: [],
  };

  apiMsg!: ApiMsg;
  errore = '';

  // Loading
  loading$ = this.loader.loading$;

  // Form
  submitted = false;

  // Alert
  showAlert = false;
  alertType: 'success' | 'danger' | 'warning' = 'warning';

  currentStep = 1; // aggiungi questa proprietà per gestire lo step corrente

  constructor(
    private userService: UserService,
    private loader: LoadingService,
  ) {}

  ngOnInit(): void {
  }

  register() {
    // const newUser: IUsers = {
    //   ...this.form.value,
    //   flagPrivacy: this.form.value.flagPrivacy ? 'Si' : 'No',
    // };

    // console.log(newUser);
    // this.userService.insUser(newUser).subscribe({
    //   next: this.onSuccess,
    //   error: error => this.handleError(error),
    // });
  }

  onSuccess = (response: any) => {
    this.apiMsg = response;
    this.onShowAlert('success');
    this.reset();
  };

  handleError = (error: any) => {
    this.errore = error;
    console.log(error);
  };

  reset() {
    this.submitted = false;
    // this.form.reset();
  }

  // matchPasswords(control: AbstractControl): ValidationErrors | null {
  //   const passwordControl = control.get('password');
  //   const confirmPasswordControl = control.get('confirmPassword');

  //   if (!passwordControl || !confirmPasswordControl) {
  //     return null; // Se uno dei due campi non esiste, esce senza errore
  //   }

  //   if (
  //     confirmPasswordControl.errors &&
  //     !confirmPasswordControl.errors['passwordMismatch']
  //   ) {
  //     return null; // Evita di sovrascrivere altri errori
  //   }

  //   if (passwordControl.value !== confirmPasswordControl.value) {
  //     confirmPasswordControl.setErrors({ passwordMismatch: true });
  //   } else {
  //     confirmPasswordControl.setErrors(null); // Rimuove l'errore se le password coincidono
  //   }

  //   return null;
  // }

  // onSubmit() {
  //   this.submitted = true;

  //   if (this.form.invalid) {
  //     return;
  //   }

  //   this.register();
  // }

  onContinua(event: any) {
    // Passa allo step successivo (esempio: incrementa di 1)
    this.currentStep++;
    // Puoi aggiungere logica per gestire i dati ricevuti da event se necessario
    console.log('Dati step:', event);
  }

  onIndietro() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  onShowAlert(alertType: 'success' | 'danger' | 'warning'): void {
    this.alertType = alertType;
    this.showAlert = true;
  }
}
