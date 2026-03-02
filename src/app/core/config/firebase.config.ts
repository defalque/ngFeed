import { InjectionToken } from '@angular/core';

export interface FirebaseConfig {
  /** Firebase Web API key (Identity Toolkit / Realtime Database). */
  apiKey: string;
  /** Firebase Realtime Database base URL (no trailing slash). */
  databaseURL: string;
}

export const FIREBASE_CONFIG = new InjectionToken<FirebaseConfig>('FIREBASE_CONFIG', {
  providedIn: 'root',
  factory: () => defaultFirebaseConfig,
});

export const defaultFirebaseConfig: FirebaseConfig = {
  apiKey: 'AIzaSyB8lGu3BskDY-nFk9w2wtw4nFOAEk98yPY',
  databaseURL: 'https://ngfeed-fefed-default-rtdb.europe-west1.firebasedatabase.app',
};
