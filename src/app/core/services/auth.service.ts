import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, tap, throwError } from 'rxjs';
import { FirebaseUser } from '../types/user.model';

export type AuthResponseData = {
  idToken: string; // A Firebase Auth ID token for the authenticated user.
  email: string; // The email for the authenticated user.
  refreshToken: string; // A Firebase Auth refresh token for the authenticated user.
  expiresIn: string; // The number of seconds in which the ID token expires.
  localId: string; // The uid of the authenticated user.
  registered?: boolean; // Whether the email is for an existing account.
  displayName?: string; // Whether the email is for an existing account.
};

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);

  authenticatedUser = signal<FirebaseUser | null>(null);
  isAuthenticated = computed(() => {
    const user = this.authenticatedUser();
    console.log(user);
    console.log(!!user && !!user.idToken && new Date() < new Date(user.expirationDate));
    return !!user && !!user.idToken && new Date() < new Date(user.expirationDate);
  });

  signup(email: string, password: string) {
    return this.http
      .post<AuthResponseData>(
        'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyB8lGu3BskDY-nFk9w2wtw4nFOAEk98yPY',
        {
          email,
          password,
          returnSecureToken: true,
        },
      )
      .pipe(
        tap((resData) => {
          const user: FirebaseUser = {
            email: resData.email,
            idToken: resData.idToken,
            localId: resData.localId,
            expirationDate: new Date(new Date().getTime() + +resData.expiresIn * 1000),
          };
          this.authenticatedUser.set(user);
          console.log(user);
        }),
        catchError((error) => {
          if (!error.error || !error.error.error) {
            return throwError(() => new Error('Errore imprevisto. Riprova a breve'));
          }
          // Rollback in caso di errore
          return throwError(() => new Error('La registrazione non è andata a buon fine'));
        }),
      );
  }

  login(email: string, password: string) {
    return this.http
      .post<AuthResponseData>(
        'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyB8lGu3BskDY-nFk9w2wtw4nFOAEk98yPY',
        {
          email,
          password,
          returnSecureToken: true,
        },
      )
      .pipe(
        tap((resData) => {
          const user: FirebaseUser = {
            email: resData.email,
            idToken: resData.idToken,
            localId: resData.localId,
            expirationDate: new Date(new Date().getTime() + +resData.expiresIn * 1000),
          };
          this.authenticatedUser.set(user);
          console.log(user);
        }),
        catchError((error) => {
          if (!error.error || !error.error.error) {
            return throwError(() => new Error('Errore imprevisto. Riprova a breve'));
          }
          // Rollback in caso di errore
          return throwError(() => new Error("L'accesso non è andato a buon fine"));
        }),
      );
  }
}
