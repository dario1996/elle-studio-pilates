import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PasswordResetService {
  private apiUrl = `${environment.apiUrl}/auth/password`;

  constructor(private http: HttpClient) {}

  requestPasswordReset(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-request`, { email });
  }

  validateResetToken(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/validate-token`, {
      params: { token }
    });
  }

  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset`, {
      token,
      newPassword
    });
  }
}