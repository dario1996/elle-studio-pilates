import { AuthJwtService } from './authJwt.service';
import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root',
})
export class JwtRolesService {
  constructor(private Auth: AuthJwtService) {}

  getRoles = (): string[] => {
    let ruoli: string[] = [];
    let token = '';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let items: any;

    token = this.Auth.getAuthToken();

    const helper = new JwtHelperService();
    const decodedToken = helper.decodeToken(token);

    // eslint-disable-next-line prefer-const
    items = decodedToken['authorities'];

    if (!Array.isArray(items)) ruoli.push(items);
    else ruoli = items;

    return ruoli;
  };
}
