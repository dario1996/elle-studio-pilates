import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Observable, catchError, throwError, switchMap } from 'rxjs';
import { AuthJwtService } from '../core/services/authJwt.service';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable()
export class GestErrorInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private auth: AuthJwtService,
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler,
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError(err => {
        console.log('Error intercepted:', err);

        let error: string =
          err.status > 0
            ? err.error.message || err.statusText
            : 'Errore Generico. Impossibile Proseguire!';

        if ([401].indexOf(err.status) !== -1) {
          const isTokenExpired =
            err.error?.error === 'Token expired' ||
            err.error?.message?.includes('expired') ||
            err.error?.message?.includes('JWT token has expired');

          if (isTokenExpired) {
            // Try to refresh token before logging out
            const refreshToken = this.auth.getRefreshToken();
            if (refreshToken && !request.url.includes('/refresh')) {
              return this.auth.refreshToken().pipe(
                switchMap(() => {
                  // Retry the original request with new token
                  const newToken = this.auth.getAuthToken();
                  const retryRequest = request.clone({
                    setHeaders: {
                      Authorization: `Bearer ${newToken}`,
                    },
                  });
                  return next.handle(retryRequest);
                }),
                catchError(refreshError => {
                  // If refresh fails, logout user
                  this.handleLogout(true);
                  return throwError(() => error);
                })
              );
            } else {
              this.handleLogout(true);
            }
          } else {
            this.handleLogout(false);
          }
        } else if ([403].indexOf(err.status) !== -1) {
          this.router.navigate(['forbidden']);
        } else if (err.status === 404) {
          error = err.error.message;
        }

        return throwError(() => error);
      }),
    );
  }

  private handleLogout(isExpired: boolean): void {
    this.auth.clearAll();
    if (isExpired) {
      this.router.navigate(['login'], { queryParams: { expired: true } });
    } else {
      this.router.navigate(['login']);
    }
    localStorage.clear();
    sessionStorage.clear();
  }
}
