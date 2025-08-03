import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { BehaviorSubject, Observable, map, catchError, throwError, switchMap, timer } from 'rxjs';
import { Token } from '../../shared/models/Token';
import { environment } from '../../../environments/environment.development';
import { AppCookieService } from './app-cookie.service';

@Injectable({
  providedIn: 'root',
})
export class AuthJwtService {
  server: string = environment.server;
  private helper = new JwtHelperService();
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);
  private isRefreshing = false;
  private tokenExpirationTimer: any;

  constructor(
    private httpClient: HttpClient,
    private storageService: AppCookieService,
  ) {
    this.initializeTokenRefresh();
  }

  autenticaService(username: string, password: string): Observable<Token> {
    return this.httpClient
      .post<Token>(`${environment.authServerUri}`, { username, password })
      .pipe(
        map(data => {
          this.storeTokens(data, username);
          this.scheduleTokenRefresh(data.accessToken);
          return data;
        }),
        catchError(error => {
          console.error('Authentication failed:', error);
          return throwError(() => error);
        })
      );
  }

  private storeTokens(tokenData: Token, username: string): void {
    sessionStorage.setItem('Utente', username);
    this.storageService.set('AuthToken', tokenData.accessToken);
    this.storageService.set('RefreshToken', tokenData.refreshToken);
    
    // Store expiration time
    const expirationTime = new Date().getTime() + (tokenData.expiresIn * 1000);
    this.storageService.set('TokenExpiration', expirationTime.toString());
  }

  refreshToken(): Observable<any> {
    const refreshToken = this.storageService.get('RefreshToken');
    
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    if (this.isRefreshing) {
      return this.refreshTokenSubject.pipe(
        switchMap(token => {
          if (token) {
            return Promise.resolve({ token });
          } else {
            return throwError(() => new Error('Token refresh failed'));
          }
        })
      );
    }

    this.isRefreshing = true;
    this.refreshTokenSubject.next(null);

    return this.httpClient
      .get<any>(`${environment.authServerUri}/refresh`, {
        headers: new HttpHeaders({ Authorization: `Bearer ${refreshToken}` }),
      })
      .pipe(
        map(data => {
          this.isRefreshing = false;
          this.storageService.set('AuthToken', data.token);
          this.refreshTokenSubject.next(data.token);
          this.scheduleTokenRefresh(data.token);
          return data;
        }),
        catchError(error => {
          this.isRefreshing = false;
          this.refreshTokenSubject.next(null);
          this.clearAll();
          return throwError(() => error);
        })
      );
  }

  private scheduleTokenRefresh(token: string): void {
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }

    try {
      const expirationDate = this.helper.getTokenExpirationDate(token);
      if (expirationDate) {
        const now = new Date().getTime();
        const expirationTime = expirationDate.getTime();
        const refreshTime = expirationTime - now - (5 * 60 * 1000); // Refresh 5 minutes before expiration

        if (refreshTime > 0) {
          this.tokenExpirationTimer = setTimeout(() => {
            this.refreshToken().subscribe({
              next: () => console.log('Token refreshed automatically'),
              error: (error) => console.error('Automatic token refresh failed:', error)
            });
          }, refreshTime);
        }
      }
    } catch (error) {
      console.error('Error scheduling token refresh:', error);
    }
  }

  private initializeTokenRefresh(): void {
    const token = this.getAuthToken();
    if (token && !this.isTokenExpired()) {
      this.scheduleTokenRefresh(token);
    }
  }

  getAuthToken(): string {
    const authToken = this.storageService.get('AuthToken');
    return authToken || '';
  }

  getRefreshToken(): string {
    const refreshToken = this.storageService.get('RefreshToken');
    return refreshToken || '';
  }

  isTokenExpired(): boolean {
    const token = this.getAuthToken();
    if (!token) {
      return true;
    }

    try {
      return this.helper.isTokenExpired(token);
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  }

  loggedUser(): string | null {
    return sessionStorage.getItem('Utente') || '';
  }

  isLogged(): boolean {
    const userLogged = sessionStorage.getItem('Utente');
    const tokenExists = this.getAuthToken();
    return userLogged ? !this.isTokenExpired() : false;
  }

  clearUser(): void {
    sessionStorage.removeItem('Utente');
  }

  clearAll(): void {
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    this.storageService.clear();
    sessionStorage.clear();
  }

  // Method to check if token will expire soon
  willTokenExpireSoon(): boolean {
    const token = this.getAuthToken();
    if (!token) return true;

    try {
      const expirationDate = this.helper.getTokenExpirationDate(token);
      if (!expirationDate) return true;

      const now = new Date().getTime();
      const timeUntilExpiration = expirationDate.getTime() - now;
      return timeUntilExpiration < (10 * 60 * 1000); // Will expire in 10 minutes
    } catch (error) {
      return true;
    }
  }
}
