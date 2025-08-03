import { ApplicationConfig } from '@angular/core';
import { provideHttpClient, withInterceptorsFromDi, HttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { GestErrorInterceptor } from './interceptors/gest-error.interceptor';
import { NetworkInterceptor } from './interceptors/network.interceptor';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

// ✅ Funzione per creare il loader delle traduzioni
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http);
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptorsFromDi()),

    // ✅ Intercettori HTTP
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: GestErrorInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: NetworkInterceptor,
      multi: true,
    },
  ],
};
