/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { LoadingService } from '../../../../core/services/loading.service';
import { DettagliProfiloComponent } from './components/dettagli-profilo/dettagli-profilo.component';
import { CertificatoMedicoComponent } from './components/certificato-medico/certificato-medico.component';
import { EmailPasswordComponent } from "./components/email-password/email-password.component";
import { RegistrazioneService, RegistrazioneRequest } from '../../../../shared/services/registrazione.service';

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
  titolo = 'Registrazione';

  // Dati completi della registrazione
  registrationData: RegistrazioneRequest = {
    // Step 1
    nome: '',
    cognome: '',
    codiceFiscale: '',
    // Step 2
    certificatoMedico: '',
    patologie: false,
    descrizionePatologie: '',
    obiettivi: '',
    // Step 3
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  };

  currentStep = 1;
  loading$ = this.loader.loading$;
  isSubmitting = false;

  // Alert
  showAlert = false;
  alertType: 'success' | 'danger' | 'warning' = 'warning';
  alertMessage = '';

  constructor(
    private registrazioneService: RegistrazioneService,
    private loader: LoadingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Inizializzazione se necessaria
  }

  /**
   * Gestisce il completamento di uno step
   */
  onStepCompleted(stepData: any) {
    console.log('Dati step ricevuti:', stepData);
    
    // Merge dei dati del step corrente
    this.registrationData = { ...this.registrationData, ...stepData };
    
    if (this.currentStep < 3) {
      this.currentStep++;
    } else {
      // Ultimo step - procedi con la registrazione
      this.submitRegistration();
    }
  }

  /**
   * Gestisce il ritorno al step precedente
   */
  onStepBack() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  /**
   * Invia i dati di registrazione al server
   */
  private submitRegistration() {
    this.isSubmitting = true;
    this.hideAlert();

    console.log('Invio registrazione:', this.registrationData);

    this.registrazioneService.registraUtente(this.registrationData).subscribe({
      next: (response) => {
        console.log('Registrazione completata:', response);
        
        // Se c'è un file da caricare, lo carica dopo la registrazione
        if (this.registrationData.certificato && this.registrationData.certificato instanceof File) {
          // Per ora assumeremo userId = 1, in un sistema reale questo dovrebbe venire dalla risposta
          this.uploadCertificato(this.registrationData.certificato, 1);
        } else {
          this.onRegistrationComplete();
        }
      },
      error: (error) => {
        console.error('Errore registrazione:', error);
        const errorMsg = error.error?.messaggio || 'Errore durante la registrazione. Riprova.';
        this.showErrorAlert(errorMsg);
        this.isSubmitting = false;
      }
    });
  }

  /**
   * Upload del certificato medico
   */
  private uploadCertificato(file: File, userId: number) {
    this.registrazioneService.uploadCertificatoMedico(file, userId).subscribe({
      next: (response) => {
        console.log('Upload certificato completato:', response);
        this.onRegistrationComplete();
      },
      error: (error) => {
        console.error('Errore upload certificato:', error);
        // La registrazione è avvenuta, ma c'è stato un errore con l'upload
        this.showSuccessAlert('Registrazione completata! Problema con l\'upload del certificato, puoi caricarlo successivamente.');
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 3000);
        this.isSubmitting = false;
      }
    });
  }

  /**
   * Completa il processo di registrazione
   */
  private onRegistrationComplete() {
    this.showSuccessAlert('Registrazione completata con successo! Verrai reindirizzato al login.');
    
    // Reindirizza al login dopo 3 secondi
    setTimeout(() => {
      this.router.navigate(['/login']);
    }, 3000);
    this.isSubmitting = false;
  }

  /**
   * Ottiene i dati del step corrente per precompilare i campi
   */
  getStepData(step: number): any {
    switch (step) {
      case 1:
        return {
          nome: this.registrationData.nome,
          cognome: this.registrationData.cognome,
          codiceFiscale: this.registrationData.codiceFiscale
        };
      case 2:
        return {
          certificatoMedico: this.registrationData.certificatoMedico,
          patologie: this.registrationData.patologie,
          descrizionePatologie: this.registrationData.descrizionePatologie,
          obiettivi: this.registrationData.obiettivi
        };
      case 3:
        return {
          username: this.registrationData.username,
          email: this.registrationData.email,
          password: this.registrationData.password,
          confirmPassword: this.registrationData.confirmPassword
        };
      default:
        return {};
    }
  }

  // Metodi per gli alert
  private showSuccessAlert(message: string) {
    this.alertMessage = message;
    this.alertType = 'success';
    this.showAlert = true;
  }

  private showErrorAlert(message: string) {
    this.alertMessage = message;
    this.alertType = 'danger';
    this.showAlert = true;
  }

  private hideAlert() {
    this.showAlert = false;
  }
}
