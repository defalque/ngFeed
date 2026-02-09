import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { User } from './models/user.model';
import { delay, map, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);

  private users = signal<User[]>([]);
  loadedUsers = this.users.asReadonly();
  private currentUser = signal<User | null>(null);
  loadedCurrentUser = this.currentUser.asReadonly();

  private readonly usersUrl =
    'https://ngfeed-fefed-default-rtdb.europe-west1.firebasedatabase.app/users.json';
  private readonly currentUserUrl =
    'https://ngfeed-fefed-default-rtdb.europe-west1.firebasedatabase.app/users/user_006.json';

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
      delay(1000), // delay artificiale per loading
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
      tap((users) => this.users.set(users)), // per eseguire side effects
      delay(1000), // delay artificiale per mostrare loading ui;
    );
  }

  private fetchUsers(url: string) {
    return this.http.get<{
      [key: string]: Omit<User, 'id'>;
    }>(url);
  }
}
