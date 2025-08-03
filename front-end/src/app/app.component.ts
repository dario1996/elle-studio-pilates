import { Component, inject, OnInit } from '@angular/core';

import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ModalComponent } from "./core/modal/modal.component";

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  imports: [RouterOutlet, ModalComponent],
})
export class AppComponent implements OnInit {
  title = 'gestionale-formazione-ui';
  private translate = inject(TranslateService);
  private defaultLang = 'it';

  ngOnInit(): void {
    const savedLang = sessionStorage.getItem('Language') || this.defaultLang;

    this.translate.setDefaultLang(this.defaultLang);
    this.translate.use(savedLang);
    this.getCurrentLanguage();
    console.log(this.translate.currentLang);
  }

  getCurrentLanguage(): string {
    return this.translate.currentLang;
  }
}
