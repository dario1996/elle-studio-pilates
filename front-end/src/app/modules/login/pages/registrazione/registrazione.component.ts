/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Component, OnInit } from '@angular/core';

import { CommonModule } from '@angular/common';
import { IUsers } from '../../../../shared/models/Users';
import { UserService } from '../../../../core/services/data/user.service';
import { ApiMsg } from '../../../../shared/models/ApiMsg';
import { RouterModule } from '@angular/router';
import { SpinnerComponent } from '../../../../core/spinner/spinner.component';
import { LoadingService } from '../../../../core/services/loading.service';

@Component({
  selector: 'app-registrazione',
  standalone: true,
  templateUrl: './registrazione.component.html',
  styleUrl: './registrazione.component.css',
  imports: [
    SpinnerComponent,
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
    RouterModule,
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
  form!: FormGroup;
  submitted = false;

  // Alert
  showAlert = false;
  alertType: 'success' | 'danger' | 'warning' = 'warning';

  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private loader: LoadingService,
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  initializeForm() {
    this.form = this.formBuilder.group(
      {
        username: [
          '',
          [
            Validators.required,
            Validators.minLength(3),
            Validators.maxLength(30),
            Validators.pattern('^[a-zA-Z0-9][a-zA-Z0-9_.]{2,29}$'), // Regex per username valido
          ],
        ],
        email: ['', [Validators.required, Validators.email]],
        cellulare: [
          '',
          [
            Validators.required,
            Validators.pattern(
              /^((\+39|0039)?3\d{9}|(\+44|0044)?7\d{9}|(\+44|0044)?(1|2)\d{8,9})$/,
            ),
          ],
        ],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.maxLength(20),
            Validators.pattern(
              '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$',
            ),
          ],
        ],
        confirmPassword: ['', [Validators.required]],
        flagPrivacy: ['', [Validators.required]],
        negozi: this.formBuilder.array([this.createNegozioForm()]),
      },
      { validators: this.matchPasswords }, // ✅ Passiamo il validator come AbstractControlOptions
    );
  }

  createNegozioForm(): FormGroup {
    return this.formBuilder.group({
      shopName: ['', [Validators.required]],
      shopCity: ['', [Validators.required]],
      shopAddress: ['', [Validators.required]],
    });
  }

  aggiungiNegozio() {
    this.negozi.push(this.createNegozioForm());
  }

  rimuoviNegozio(negozioIndex: number) {
    if (this.negozi.length > 1) {
      this.negozi.removeAt(negozioIndex);
    }
  }

  register() {
    const newUser: IUsers = {
      ...this.form.value,
      flagPrivacy: this.form.value.flagPrivacy ? 'Si' : 'No',
    };

    console.log(newUser);
    this.userService.insUser(newUser).subscribe({
      next: this.onSuccess,
      error: error => this.handleError(error),
    });
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
    this.form.reset();
  }

  matchPasswords(control: AbstractControl): ValidationErrors | null {
    const passwordControl = control.get('password');
    const confirmPasswordControl = control.get('confirmPassword');

    if (!passwordControl || !confirmPasswordControl) {
      return null; // Se uno dei due campi non esiste, esce senza errore
    }

    if (
      confirmPasswordControl.errors &&
      !confirmPasswordControl.errors['passwordMismatch']
    ) {
      return null; // Evita di sovrascrivere altri errori
    }

    if (passwordControl.value !== confirmPasswordControl.value) {
      confirmPasswordControl.setErrors({ passwordMismatch: true });
    } else {
      confirmPasswordControl.setErrors(null); // Rimuove l'errore se le password coincidono
    }

    return null;
  }

  onSubmit() {
    this.submitted = true;

    if (this.form.invalid) {
      return;
    }

    this.register();
  }

  get f(): Record<string, AbstractControl> {
    return this.form.controls;
  }

  get negozi() {
    return this.form.controls['negozi'] as FormArray;
  }

  get negozioFormGroups(): FormGroup[] {
    return this.negozi.controls as FormGroup[];
  }

  onShowAlert(alertType: 'success' | 'danger' | 'warning'): void {
    this.alertType = alertType;
    this.showAlert = true;
  }
}
