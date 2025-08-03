import { Injectable, inject } from '@angular/core';

import { ApiMsg } from '../../../shared/models/ApiMsg';
import { HttpClient } from '@angular/common/http';
import { IUsers } from '../../../shared/models/Users';
import { environment } from '../../../../environments/environment.development';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  server: string = environment.server;
  port: string = environment.portUser;

  //constructor() {}

  httpClient = inject(HttpClient);

  insUser = (user: IUsers) =>
    this.httpClient.post<ApiMsg>(
      `http://${this.server}:${this.port}/api/utenti/register`,
      user,
    );
}
