import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding, withRouterConfig } from '@angular/router';

import { routes } from './app.routes';

import { provideHttpClient } from '@angular/common/http';
import { FIREBASE_CONFIG, defaultFirebaseConfig } from './core/config/firebase.config';

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: FIREBASE_CONFIG, useValue: defaultFirebaseConfig },
    provideHttpClient(),
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(), // posso accedere a dynamic params della rotta automaticamente tramite input binding
      withRouterConfig({
        paramsInheritanceStrategy: 'always', // posso accedere ai dynamic params della parent route automaticamente tramite input binding (your-feeds.ts; line 16)
      }),
    ),
  ],
};
