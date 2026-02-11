import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding, withRouterConfig } from '@angular/router';

import { routes } from './app.routes';

import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { provideHttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(), // posso accedere a dynamic params della rotta automaticamente tramite input binding
      withRouterConfig({
        paramsInheritanceStrategy: 'always', // posso accedere ai dynamic params della parent route automaticamente tramite input binding (your-feeds.ts; line 16)
      }),
    ),
    providePrimeNG({
      theme: {
        preset: Aura,
      },
    }),
  ],
};
