import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, timer } from 'rxjs';
import { AuthJwtService } from './authJwt.service';

@Injectable({
  providedIn: 'root',
})
export class TokenManagerService {
  private tokenStatus$ = new BehaviorSubject<'valid' | 'expired' | 'expiring'>(
    'valid'
  );
  private heartbeatInterval: any;

  constructor(private authService: AuthJwtService) {
    this.startHeartbeat();
  }

  getTokenStatus(): Observable<'valid' | 'expired' | 'expiring'> {
    return this.tokenStatus$.asObservable();
  }

  private startHeartbeat(): void {
    // Check token status every 30 seconds
    this.heartbeatInterval = setInterval(() => {
      this.checkTokenStatus();
    }, 30000);
  }

  private checkTokenStatus(): void {
    if (!this.authService.isLogged()) {
      this.tokenStatus$.next('expired');
      return;
    }

    if (this.authService.willTokenExpireSoon()) {
      this.tokenStatus$.next('expiring');
      // Attempt to refresh token
      this.authService.refreshToken().subscribe({
        next: () => {
          this.tokenStatus$.next('valid');
        },
        error: () => {
          this.tokenStatus$.next('expired');
        },
      });
    } else {
      this.tokenStatus$.next('valid');
    }
  }

  stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
  }

  ngOnDestroy(): void {
    this.stopHeartbeat();
  }
}
