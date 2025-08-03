import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AppCookieService {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private cookieStore: any = {};

  constructor() {
    this.parseCookies(document.cookie, false);
  }

  public parseCookies(cookies = document.cookie, clear: boolean) {
    this.cookieStore = {};

    if (!!cookies === false) {
      return;
    }

    const cookiesArr = cookies.split(';');

    for (const cookie of cookiesArr) {
      const cookieArr = cookie.split('=');
      if (clear) {
        this.remove(cookieArr[0].trim());
      } else {
        this.cookieStore[cookieArr[0].trim()] = cookieArr[1];
      }
    }
  }

  get(key: string) {
    this.parseCookies(document.cookie, false);
    return this.cookieStore[key] ? this.cookieStore[key] : null;
  }

  remove(key: string) {
    document.cookie = `${key} = ; expires=Thu, 1 jan 1990 12:00:00 UTC; path=/`;
  }

  set(key: string, value: string) {
    document.cookie = key + '=' + (value || '');
  }

  clear = () => {
    this.parseCookies(document.cookie, true);
  };
}
