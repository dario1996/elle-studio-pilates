import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RegistrazioneRequest {
  // Step 1: Dettagli Profilo
  nome: string;
  cognome: string;
  codiceFiscale: string;
  
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
  private apiUrl = 'http://localhost:8080/api/registrazione';

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
   * Upload certificato medico
   */
  uploadCertificatoMedico(file: File, userId: number): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('userId', userId.toString());
    
    return this.http.post(`http://localhost:8080/api/upload/certificato-medico`, formData);
  }
}
