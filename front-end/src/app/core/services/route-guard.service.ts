/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { Injectable, inject } from '@angular/core';

import { AuthJwtService } from './authJwt.service';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root',
})
export class RouteGuardService {
  private token = '';
  private ruoli: string[] = [];

  constructor(
    private Auth: AuthJwtService,
    private route: Router,
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): boolean {
    if (!this.Auth.isLogged()) {
      console.log('Accesso NON Consentito - Utente non autenticato');
      this.route.navigate(['login']);
      return false;
    }

    this.token = this.Auth.getAuthToken();
    if (!this.token) {
      console.log('Token non presente - Accesso negato');
      this.Auth.clearAll();
      this.route.navigate(['login']);
      return false;
    }

    const helper = new JwtHelperService();

    // Check if token is expired
    try {
      if (helper.isTokenExpired(this.token)) {
        console.log('Token scaduto - Reindirizzamento al login');
        this.Auth.clearAll();
        this.route.navigate(['login'], { queryParams: { expired: true } });
        return false;
      }
    } catch (error) {
      console.log('Errore nel controllo del token - Token non valido');
      this.Auth.clearAll();
      this.route.navigate(['login']);
      return false;
    }

    const decodedToken = helper.decodeToken(this.token);

    if (!decodedToken || !decodedToken['authorities']) {
      console.log('Token non valido o senza ruoli - Accesso negato');
      this.Auth.clearAll();
      this.route.navigate(['login']);
      return false;
    }

    this.ruoli = Array.isArray(decodedToken['authorities'])
      ? decodedToken['authorities']
      : [decodedToken['authorities']];

    const requiredRoles: string[] = next.data['roles'] || [];

    if (
      requiredRoles.length === 0 ||
      this.ruoli.some(role => requiredRoles.includes(role))
    ) {
      return true;
    } else {
      console.log('Ruolo non autorizzato - Accesso negato');
      this.route.navigate(['forbidden']);
      return false;
    }
  }
}

export const AuthGuard: CanActivateFn = (
  next: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
): boolean => {
  return inject(RouteGuardService).canActivate(next, state);
};
