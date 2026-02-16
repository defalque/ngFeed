import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';

import { catchError, debounce, debounceTime, delay, map, tap, throwError } from 'rxjs';
import { EditedUser, User } from '../types/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);

  private allUsers = signal<User[]>([]);
  loadedAllUsers = this.allUsers.asReadonly();

  private currentUser = signal<User | null>(null);
  loadedCurrentUser = this.currentUser.asReadonly();

  user = signal<User | null>(null);

  private readonly usersUrl =
    'https://ngfeed-fefed-default-rtdb.europe-west1.firebasedatabase.app/users.json';
  private readonly userUrl =
    'https://ngfeed-fefed-default-rtdb.europe-west1.firebasedatabase.app/users/';
  private readonly currentUserUrl =
    'https://ngfeed-fefed-default-rtdb.europe-west1.firebasedatabase.app/users/user_006.json';

  fetchUser(id: string) {
    const url = this.userUrl + id + '.json';
    return this.fetchUsers(url).pipe(
      map((res) => {
        if (!res) return null;

        return { id, ...res } as User;
      }),
      tap((user) => {
        if (user) this.user.set(user); // side effect
      }),
      delay(500), // delay artificiale per loading ui
    );
  }

  fetchCurrentUser() {
    return this.fetchUsers(this.currentUserUrl).pipe(
      map((res) => {
        if (!res) return null;

        // res è già l'oggetto utente, cambierà
        return { id: 'user_006', ...res } as User;
      }),
      tap((user) => {
        if (user) this.currentUser.set(user); // side effect
      }),
      delay(500), // delay artificiale per loading ui
    );
  }

  fetchAllUsers() {
    return this.fetchUsers(this.usersUrl).pipe(
      map((res) => {
        if (!res) return [];

        const users: User[] = [];
        for (const key in res) {
          if (Object.prototype.hasOwnProperty.call(res, key)) {
            if (key !== 'user_006')
              users.push({
                id: key, // ID preso dalla key di Firebase
                ...res[key], // dati senza id
              });
          }
        }
        return users;
      }),
      tap((users) => this.allUsers.set(users)), // per eseguire side effects
      delay(500), // delay artificiale per mostrare loading ui;
    );
  }

  updateUser(userId: string, newUserData: EditedUser) {
    return this.editUser(
      `https://ngfeed-fefed-default-rtdb.europe-west1.firebasedatabase.app/users/${userId}.json`,
      newUserData,
    ).pipe(
      delay(2000),
      tap((updatedUser) => {
        this.currentUser.update((oldData) => {
          if (!oldData) return null; // Protezione se l'utente non esiste

          // Uniamo i vecchi dati con quelli nuovi (updatedUser)
          return {
            ...oldData,
            ...updatedUser,
          };
        });
        this.user.update((oldData) => {
          if (!oldData) return null; // Protezione se l'utente non esiste

          // Uniamo i vecchi dati con quelli nuovi (updatedUser)
          return {
            ...oldData,
            ...updatedUser,
          };
        });
      }),
      catchError((error) => {
        // Rollback in caso di errore
        return throwError(() => new Error('Richiesta fallita!'));
      }),
    );
  }

  checkUniqueUsername(username: string) {
    return this.fetchUsers(
      `https://ngfeed-fefed-default-rtdb.europe-west1.firebasedatabase.app/usernames/${username}.json`,
    ).pipe(
      map((res) => {
        return res !== null;
      }),
    );
  }

  private editUser(url: string, newUserData: EditedUser) {
    return this.http.patch(url, newUserData);
  }

  private fetchUsers(url: string) {
    return this.http.get<{
      [key: string]: Omit<User, 'id'>;
    }>(url);
  }
}
