import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { AuthInterceptor } from './core/services/auth-interceptor';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import {  HTTP_INTERCEPTORS, withInterceptorsFromDi } from '@angular/common/http';
export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withFetch(),withInterceptorsFromDi()),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes), provideClientHydration(withEventReplay()),

    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ]
};
