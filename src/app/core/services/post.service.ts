import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, delay, EMPTY, map, Observable, of, switchMap, tap, throwError } from 'rxjs';
import { EditedPost, FirebasePost, NewPost, Post } from '@/core/types/post.model';
import { UserService } from './user.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  authenticatedUser = this.authService.authenticatedUser;

  private allPosts = signal<Post[]>([]);
  allLoadedPosts = this.allPosts.asReadonly();

  private authUserPosts = signal<Post[]>([]);
  authUserPostsReadonly = this.authUserPosts.asReadonly();
  setAuthUserPosts(value: Post[] | []) {
    this.authUserPosts.set(value);
  }
  updateAuthUserPosts(updater: (posts: Post[]) => Post[]) {
    this.authUserPosts.update(updater);
  }

  private genericUserPosts = signal<Post[]>([]);
  genericUserPostsReadonly = this.genericUserPosts.asReadonly();

  private userPost = signal<Post | null>(null);
  userPostReadonly = this.userPost.asReadonly();
  setUserPost(value: Post | null) {
    this.userPost.set(value);
  }

  private savedPostsIds = signal<string[]>([]);
  loadedSavedPostsIds = this.savedPostsIds.asReadonly();
  setSavedPostsIds(value: string[]) {
    this.savedPostsIds.set(value);
  }

  // followedPosts = computed(() => {
  //   return this.allPosts().filter((post) => post.userId === 'user_002');
  // });

  private readonly postsUrl =
    'https://ngfeed-fefed-default-rtdb.europe-west1.firebasedatabase.app/posts.json';

  // fetcha tutti i post di tutti gli utenti
  fetchAllPosts() {
    return this.fetchPosts(this.postsUrl).pipe(
      map((res) => {
        if (!res) return [];

        const posts: Post[] = [];
        for (const key in res) {
          if (Object.prototype.hasOwnProperty.call(res, key)) {
            posts.push({
              id: key, // ID preso dalla key di Firebase
              ...res[key], // dati senza id
            });
          }
        }
        return posts;
      }),
      tap((posts) => this.allPosts.set(posts)),
      delay(500), // delay artificiale per mostrare loading ui;
    );
  }

  // fetcha tutti i post di utente specifico e imposta lo stato corrsipondente (authUserPosts oppure genericUserPosts)
  fetchPostsByUser(userId: string, isAuthUser = false) {
    return this.http
      .get<{
        [key: string]: Post;
      }>(
        `https://ngfeed-fefed-default-rtdb.europe-west1.firebasedatabase.app/posts.json?orderBy="userId"&equalTo="${userId}"`,
      )
      .pipe(
        map((res) => {
          if (!res) return [];

          const posts: Post[] = [];
          for (const key in res) {
            if (Object.prototype.hasOwnProperty.call(res, key)) {
              posts.push({
                ...res[key],
                id: key,
              });
            }
          }
          return posts;
        }),
        tap((posts) => {
          if (isAuthUser) {
            this.authUserPosts.set(posts);
          } else {
            this.genericUserPosts.set(posts);
          }
        }),
        delay(500), // delay artificiale per mostrare loading ui;
      );
  }

  fetchPost(postId: string, isAuthUser = false) {
    return this.http
      .get<Post>(
        `https://ngfeed-fefed-default-rtdb.europe-west1.firebasedatabase.app/posts/${postId}.json`,
      )
      .pipe(
        map((res) => {
          if (!res) return null;

          const post: Post = { ...res, id: postId };
          return post;
        }),
        tap((post) => {
          if (!post) return;
          this.userPost.set(post);
        }),
        delay(500), // delay artificiale per loading UI
      );
  }

  createPost(post: NewPost) {
    const authUser = this.authenticatedUser();
    const uid = authUser?.localId;
    const token = authUser?.idToken;

    if (!uid || !token) return EMPTY;

    return this.http
      .post<{ name: string }>(
        `https://ngfeed-fefed-default-rtdb.europe-west1.firebasedatabase.app/posts.json?auth=${token}`,
        { userId: uid }, // necessario per superare le rules
      )
      .pipe(
        switchMap((response) => {
          const postId = response.name;

          const newPostData = {
            ...post,
            userId: uid,
            created_at: new Date().toISOString(),
            likesCount: 0,
            commentsCount: 0,
          };

          const updates: any = {
            [`posts/${postId}`]: newPostData,
            [`user-posts/${uid}/${postId}`]: true,
          };

          const newPost: Post = {
            ...newPostData,
            id: postId,
          };

          // multi-location update atomico
          return this.http
            .patch(
              `https://ngfeed-fefed-default-rtdb.europe-west1.firebasedatabase.app/.json?auth=${token}`,
              updates,
            )
            .pipe(map(() => newPost));
        }),
        delay(500),
        tap((newPost) => {
          this.allPosts.update((posts) => [newPost, ...posts]);
          this.authUserPosts.update((posts) => [newPost, ...posts]);
        }),
        catchError(() => {
          return throwError(() => new Error('Post creation failed'));
        }),
      );
  }

  deletePost(postId: string) {
    const authUser = this.authenticatedUser();
    const userId = authUser?.localId;
    const token = authUser?.idToken;

    if (!token || !postId || !userId) return EMPTY;

    const updates: any = {
      [`posts/${postId}`]: null,
      [`user-posts/${userId}/${postId}`]: null,
    };

    return this.http
      .patch(
        `https://ngfeed-fefed-default-rtdb.europe-west1.firebasedatabase.app/.json?auth=${token}`,
        updates,
      )
      .pipe(
        delay(2000),
        tap(() => {
          this.allPosts.update((posts) => posts.filter((p) => p.id !== postId));
          this.authUserPosts.update((posts) => posts.filter((p) => p.id !== postId));

          console.log(`Post ${postId} eliminato con successo.`);
        }),
        catchError((error) => {
          console.error(error);
          return throwError(() => new Error('Post deletion failed'));
        }),
      );
  }

  editPost(postId: string, editedPost: EditedPost) {
    const authUser = this.authenticatedUser();
    const userId = authUser?.localId;
    const token = authUser?.idToken;

    if (!token || !postId || !userId) return EMPTY;

    const updates: any = {};

    Object.keys(editedPost).forEach((key) => {
      updates[`posts/${postId}/${key}`] = (editedPost as any)[key];
    });

    return this.http
      .patch(
        `https://ngfeed-fefed-default-rtdb.europe-west1.firebasedatabase.app/.json?auth=${token}`,
        updates,
      )
      .pipe(
        delay(2000), // delay artificiale per loading ui
        tap(() => {
          this.authUserPosts.update((oldPosts) => {
            return oldPosts.map((post) => (post.id === postId ? { ...post, ...editedPost } : post));
          });
        }),
        catchError((error) => {
          return throwError(() => new Error('Post creation failed'));
        }),
      );
  }

  savePostAction(postId: string, mode: 'save' | 'unsave') {
    const uid = this.authenticatedUser()?.localId;
    const token = this.authenticatedUser()?.idToken;
    if (!token) return EMPTY;

    const updates: any = {};
    if (mode === 'save') {
      updates[`user-saved-posts/${uid}/${postId}`] = true;
    } else {
      updates[`user-saved-posts/${uid}/${postId}`] = null;
    }

    return this.http
      .patch(
        `https://ngfeed-fefed-default-rtdb.europe-west1.firebasedatabase.app/.json?auth=${token}`,
        updates,
      )
      .pipe(
        delay(500),
        tap(() => {
          if (mode === 'save') {
            this.savedPostsIds.update((savedPostsIds) => [...savedPostsIds, postId]);
          } else {
            this.savedPostsIds.update((savedPostsIds) =>
              savedPostsIds.filter((id) => id !== postId),
            );
          }
        }),
        catchError((error) => {
          return throwError(() => new Error('Save post failed'));
        }),
      );
  }

  fetchSavedPostsIds() {
    const authUser = this.authenticatedUser();
    const uid = authUser?.localId;
    const token = authUser?.idToken;

    if (!uid || !token) {
      this.savedPostsIds.set([]);
      return of<string[]>([]);
    }

    return this.http
      .get<
        string[]
      >(`https://ngfeed-fefed-default-rtdb.europe-west1.firebasedatabase.app/user-saved-posts/${uid}.json`)
      .pipe(
        map((res) => {
          if (!res) return [];
          return Object.keys(res);
        }),
        tap((savedPostsIds) => this.savedPostsIds.set(savedPostsIds)),
      );
  }

  // utility
  private fetchPosts(url: string) {
    return this.http.get<{
      [key: string]: FirebasePost;
    }>(url);
  }
}
