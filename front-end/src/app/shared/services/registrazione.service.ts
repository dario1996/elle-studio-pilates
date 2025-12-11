import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface RegistrazioneRequest {
  // Step 1: Dettagli Profilo
  nome: string;
  cognome: string;
  codiceFiscale: string;
  indirizzo: string;
  città: string;
  telefono?: string;
  
  // Step 2: Certificato Medico
  certificato?: File;  // File object per l'upload
  certificatoMedico?: string;
  patologie: boolean;
  descrizionePatologie?: string;
  obiettivi?: string;
  
  // Step 3: Email e Password
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ApiResponse {
  data: string;
  messaggio: string;
}

@Injectable({
  providedIn: 'root'
})
export class RegistrazioneService {
  private apiUrl = "${environment.apiUrl}/registrazione";

  constructor(private http: HttpClient) {}

  /**
   * Registra un nuovo utente
   */
  registraUtente(dati: RegistrazioneRequest): Observable<ApiResponse> {
    return this.http.post<ApiResponse>(`${this.apiUrl}/utente`, dati, {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    });
  }

  /**
   * Upload certificato medico durante la registrazione (senza autenticazione)
   */
  uploadCertificatoMedico(file: File, userId: number): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId.toString());
    
    // Usa l'endpoint di registrazione che non richiede autenticazione
    return this.http.post(`${this.apiUrl}/certificato-medico`, formData);
  }
}
