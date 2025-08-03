import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, switchMap, catchError, throwError } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AppCookieService } from '../core/services/app-cookie.service';
import { AuthJwtService } from '../core/services/authJwt.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private auth: AuthJwtService,
    private storageService: AppCookieService,
  ) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler,
  ): Observable<HttpEvent<unknown>> {
    
    // Skip auth for login and refresh requests
    if (request.url.includes('/auth') || request.url.includes('/refresh')) {
      return next.handle(request);
    }

    const token = this.storageService.get('AuthToken');

    if (token && this.auth.loggedUser()) {
      // Check if token will expire soon and refresh if needed
      if (this.auth.willTokenExpireSoon()) {
        return this.auth.refreshToken().pipe(
          switchMap(() => {
            const newToken = this.storageService.get('AuthToken');
            const authReq = this.addTokenToRequest(request, newToken);
            return next.handle(authReq);
          }),
          catchError(error => {
            // If refresh fails, proceed with original request
            const authReq = this.addTokenToRequest(request, token);
            return next.handle(authReq);
          })
        );
      } else {
        const authReq = this.addTokenToRequest(request, token);
        return next.handle(authReq).pipe(
          tap((event: HttpEvent<unknown>) => {
            // Check for token extension header
            if (event instanceof HttpResponse) {
              const newToken = event.headers.get('X-New-Token');
              if (newToken) {
                this.storageService.set('AuthToken', newToken);
                console.log('Token extended based on activity');
              }
            }
          })
        );
      }
    }

    return next.handle(request);
  }

  private addTokenToRequest(request: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token.replace(/^Bearer\s+/, '')}`,
      },
    });
  }
}
