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
    indirizzo: '',
    città: '',
    telefono: '',
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
        console.log('Tipo di certificato:', typeof this.registrationData.certificato);
        console.log('Certificato presente?', !!this.registrationData.certificato);
        console.log('Certificato è File?', this.registrationData.certificato instanceof File);
        
        // Se c'è un file certificato da caricare
        if (this.registrationData.certificato && this.registrationData.certificato instanceof File) {
          // Estrai l'ID utente dalla risposta
          const userId = this.extractUserIdFromResponse(response);
          console.log('UserId estratto:', userId);
          
          if (userId) {
            console.log('Inizio upload certificato per userId:', userId);
            // Carica il certificato medico come BLOB
            this.registrazioneService.uploadCertificatoMedico(
              this.registrationData.certificato, 
              userId
            ).subscribe({
              next: (uploadResponse) => {
                console.log('Certificato medico caricato con successo:', uploadResponse);
                // Reindirizza al login
                this.router.navigate(['/login'], { 
                  queryParams: { registered: 'true' } 
                });
              },
              error: (error) => {
                console.error('Errore upload certificato:', error);
                console.error('Dettagli errore:', error.error);
                // Anche se l'upload fallisce, reindirizza comunque al login
                // perché l'utente è stato registrato
                this.router.navigate(['/login'], { 
                  queryParams: { registered: 'true', certificateError: 'true' } 
                });
              }
            });
          } else {
            console.warn('Nessun ID utente trovato nella risposta');
            // Nessun ID utente trovato, reindirizza comunque
            this.router.navigate(['/login'], { 
              queryParams: { registered: 'true', certificateError: 'true' } 
            });
          }
        } else {
          console.log('Nessun certificato da caricare o tipo non valido');
          // Nessun certificato da caricare, reindirizza direttamente
          this.router.navigate(['/login'], { 
            queryParams: { registered: 'true' } 
          });
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
   * Estrae l'ID utente dalla risposta del server
   */
  private extractUserIdFromResponse(response: any): number | null {
    // Backend restituisce InfoMsg con campo userId
    if (response.userId) return response.userId;
    
    // Prova altri percorsi comuni per l'ID
    if (response.id) return response.id;
    if (response.data?.id) return response.data.id;
    if (response.data?.userId) return response.data.userId;
    
    // Se la risposta è una stringa che contiene l'ID
    if (typeof response.data === 'string') {
      const match = response.data.match(/\d+/);
      if (match) return parseInt(match[0], 10);
    }
    
    return null;
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
          codiceFiscale: this.registrationData.codiceFiscale,
          indirizzo: this.registrationData.indirizzo,
          città: this.registrationData.città,
          telefono: this.registrationData.telefono
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
