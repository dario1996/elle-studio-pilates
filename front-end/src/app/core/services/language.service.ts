import { inject, Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private translate = inject(TranslateService);
  private defaultLang = 'it';

  constructor() {
    const savedLang = sessionStorage.getItem('Language') || this.defaultLang;
    this.translate.setDefaultLang(this.defaultLang);
    this.translate.use(savedLang);
  }

  getCurrentLanguage(): string {
    return this.translate.currentLang;
  }

  changeLanguage(lang: string): void {
    this.translate.use(lang);
    sessionStorage.setItem('Language', lang);
  }
}
