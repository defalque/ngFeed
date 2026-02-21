import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, delay, EMPTY, map, Observable, of, tap, throwError } from 'rxjs';
import { EditedUser, User } from '../types/user.model';
import { AuthService } from './auth.service';
import { PostService } from './post.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private postService = inject(PostService);
  authenticatedUser = this.authService.authenticatedUser;

  private allUsers = signal<User[]>([]);
  loadedAllUsers = this.allUsers.asReadonly();

  private currentUser = signal<User | null>(null);
  loadedCurrentUser = this.currentUser.asReadonly();
  setUser(value: User | null) {
    this.currentUser.set(value);
  }

  private genericUser = signal<User | null>(null);
  loadedGenericUser = this.genericUser.asReadonly();
  setGenericUser(value: User | null) {
    this.genericUser.set(value);
  }

  private followedIds = signal<string[]>([]);
  loadedFollowedIds = this.followedIds.asReadonly();
  setFollowedIds(value: string[]) {
    this.followedIds.set(value);
  }

  private readonly usersUrl =
    'https://ngfeed-fefed-default-rtdb.europe-west1.firebasedatabase.app/users.json';

  // fetcha info di utente generico
  fetchUserInfo(uid: string) {
    return this.fetchUsers(
      `https://ngfeed-fefed-default-rtdb.europe-west1.firebasedatabase.app/users/${uid}.json?`,
    ).pipe(
      map((res) => {
        if (!res) return null;

        return { id: uid, ...res } as User;
      }),
      tap((user) => {
        if (user) {
          this.genericUser.set(user);
        }
      }),
      delay(500), // delay artificiale per loading ui
    );
  }

  fetchFollowedIds() {
    const authUser = this.authenticatedUser();
    const uid = authUser?.localId;
    const token = authUser?.idToken;

    if (!uid || !token) {
      this.followedIds.set([]);
      return of<string[]>([]);
    }

    return this.http
      .get<Record<
        string,
        true
      > | null>(`https://ngfeed-fefed-default-rtdb.europe-west1.firebasedatabase.app/user-following/${uid}.json?auth=${token}`)
      .pipe(
        map((res) => Object.keys(res ?? {})),
        tap((followedIds) => {
          this.followedIds.set(followedIds);
        }),
      );
  }

  // fetcha info di utente autenticato
  fetchAuthUserInfo() {
    const authUser = this.authenticatedUser();
    // console.log(authUser);
    const uid = authUser?.localId;
    const token = authUser?.idToken;

    if (!uid || !token) return of(null);

    return this.fetchUsers(
      `https://ngfeed-fefed-default-rtdb.europe-west1.firebasedatabase.app/users/${uid}.json?auth=${token}`,
    ).pipe(
      map((res) => {
        if (!res) return null;

        return { id: uid, ...res } as User;
      }),
      tap((user) => {
        if (user) this.currentUser.set(user);
      }),
      delay(500), // delay artificiale per loading ui
    );
  }

  // crea info pubbliche utente in firebase realtime db
  createAuthUserInfo(userInfo: EditedUser): Observable<any> {
    const authUser = this.authenticatedUser();
    const uid = authUser?.localId;
    const token = authUser?.idToken;

    if (!uid || !token) return of(null);

    return this.http
      .put(
        `https://ngfeed-fefed-default-rtdb.europe-west1.firebasedatabase.app/users/${uid}.json?auth=${token}`,
        { ...userInfo, followingCount: 0, followersCount: 0 },
      )
      .pipe(
        delay(500),
        tap(() => {
          this.currentUser.set({ ...userInfo, followingCount: 0, followersCount: 0 } as User);
        }),
        catchError((error) => {
          return throwError(() => new Error('Errore durante la creazione del profilo'));
        }),
      );
  }

  // modifica info pubbliche utente in firebase realtime db (atomico, modifica anche info utente nei suoi post)
  updateAuthUserInfo(newUserData: EditedUser) {
    const uid = this.authenticatedUser()?.localId;
    const token = this.authenticatedUser()?.idToken;
    if (!token) return EMPTY;

    const updates: any = {};

    Object.keys(newUserData).forEach((key) => {
      // Questo crea chiavi tipo: "users/123/firstName", "users/123/username", ecc.
      updates[`users/${uid}/${key}`] = (newUserData as any)[key];
    });

    const userPosts = this.postService.authUserPostsReadonly();

    userPosts.forEach((post) => {
      updates[`posts/${post.id}/userFirstName`] = newUserData.firstName;
      updates[`posts/${post.id}/userLastName`] = newUserData.lastName;
      updates[`posts/${post.id}/userUsername`] = newUserData.username;
      updates[`posts/${post.id}/userIsVerified`] = newUserData.isVerified;
      updates[`posts/${post.id}/userAvatar`] = newUserData.avatar;
    });

    return this.http
      .patch(
        `https://ngfeed-fefed-default-rtdb.europe-west1.firebasedatabase.app/.json?auth=${token}`,
        updates,
      )
      .pipe(
        delay(500),
        tap(() => {
          console.log(this.currentUser());
          this.currentUser.update((oldUserData) => {
            if (!oldUserData) return null;
            console.log(oldUserData);

            return {
              ...oldUserData, // Mantiene id, followersCount, followingCount, ecc.
              ...newUserData, // Sovrascrive firstName, lastName, username, bio, ecc.
            };
          });
          this.postService.updateAuthUserPosts((posts) =>
            posts.map((post) => ({
              ...post,
              userFirstName: newUserData.firstName,
              userLastName: newUserData.lastName,
              userUsername: newUserData.username,
              userIsVerified: newUserData.isVerified,
              userAvatar: newUserData.avatar,
            })),
          );
        }),
        catchError((error) => {
          return throwError(() => new Error('Errore durante la modifica del profilo'));
        }),
      );
  }

  // fetcha info pubbliche di tutti gli utenti, utilizzato in /search
  fetchAllUsers() {
    const authId = this.authenticatedUser()?.localId;

    return this.fetchUsers(this.usersUrl).pipe(
      map((res) => {
        if (!res) return [];

        const users: User[] = [];
        for (const key in res) {
          if (Object.prototype.hasOwnProperty.call(res, key)) {
            // se authId è definito escludilo, altrimenti includi tutti
            if (!authId || key !== authId) {
              users.push({
                id: key,
                ...res[key],
              });
            }
          }
        }
        return users;
      }),
      tap((users) => this.allUsers.set(users)),
      catchError((error) => {
        return throwError(() => new Error('Errore durante il caricamento degli utenti'));
      }),
      delay(500),
    );
  }

  searchUser(term: string) {
    return this.http
      .get<Record<string, User>>(
        'https://ngfeed-fefed-default-rtdb.europe-west1.firebasedatabase.app/users.json',
        {
          params: {
            orderBy: '"username"',
            startAt: `"${term}"`,
            endAt: `"${term}\uf8ff"`,
          },
        },
      )
      .pipe(
        map((data) =>
          Object.entries(data ?? {}).map(([key, value]) => ({
            ...value,
            id: key,
          })),
        ),
        catchError((error) => {
          return throwError(() => new Error('Errore durante la ricerca degli utenti'));
        }),
        delay(500),
      );
  }

  followAction(otherUserId: string, mode: 'follow' | 'unfollow') {
    const uid = this.authenticatedUser()?.localId;
    const token = this.authenticatedUser()?.idToken;
    if (!token) return EMPTY;

    const updates: any = {};
    if (mode === 'follow' && this.currentUser()) {
      updates[`user-following/${uid}/${otherUserId}`] = true;
      updates[`user-followers/${otherUserId}/${uid}`] = true;
    } else {
      updates[`user-following/${uid}/${otherUserId}`] = null;
      updates[`user-followers/${otherUserId}/${uid}`] = null;
    }

    return this.http
      .patch(
        `https://ngfeed-fefed-default-rtdb.europe-west1.firebasedatabase.app/.json?auth=${token}`,
        updates,
      )
      .pipe(
        delay(500),
        tap(() => {
          if (mode === 'follow') {
            this.currentUser.update((user) => {
              if (!user) return null;
              return { ...user, followingCount: user.followingCount + 1 };
            });
            this.followedIds.update((followedIds) => [...followedIds, otherUserId]);
          } else {
            this.currentUser.update((user) => {
              if (!user) return null;
              return { ...user, followingCount: user.followingCount - 1 };
            });
            this.followedIds.update((followedIds) =>
              followedIds.filter((id) => id !== otherUserId),
            );
          }
        }),
        catchError((error) => {
          return throwError(() => new Error('Errore imprevisto. Riprova a breve.'));
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

  // utility
  private editUser(url: string, newUserData: EditedUser) {
    return this.http.patch(url, newUserData);
  }

  // utility
  private fetchUsers(url: string) {
    return this.http.get<{
      [key: string]: Omit<User, 'id'>;
    }>(url);
  }
}
