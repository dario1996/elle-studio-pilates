import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { importProvidersFrom } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { registerLocaleData } from '@angular/common';
import localeIt from '@angular/common/locales/it';

registerLocaleData(localeIt);
// ✅ Funzione per il loader delle traduzioni
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(HttpClient),

    // ✅ Aggiunto il supporto per la traduzione
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient],
        },
      }),
    ),

    // ✅ Supporto per ngx-toastr
    importProvidersFrom(BrowserAnimationsModule),
    importProvidersFrom(
      ToastrModule.forRoot({
        positionClass: 'toast-bottom-right',
        timeOut: 4000,
        closeButton: false,
        progressBar: false,
        preventDuplicates: true,
        maxOpened: 3,
        newestOnTop: true,
        tapToDismiss: true,
        toastClass: 'radix-toast',
        titleClass: 'radix-toast-title',
        messageClass: 'radix-toast-message',
        enableHtml: false,
        // Disable all animations
        easeTime: 0,
        easing: 'linear'
      }),
    ),

    appConfig.providers, // ✅ Usa i provider definiti in app.config.ts
  ],
}).catch(err => console.error(err));
