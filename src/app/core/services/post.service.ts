import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, delay, EMPTY, map, of, switchMap, tap, throwError } from 'rxjs';
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

  private genericUserPosts = signal<Post[]>([]);
  genericUserPostsReadonly = this.genericUserPosts.asReadonly();

  private userPost = signal<Post | null>(null);
  userPostReadonly = this.userPost.asReadonly();
  setUserPost(value: Post | null) {
    this.userPost.set(value);
  }

  followedPosts = computed(() => {
    return this.allPosts().filter((post) => post.userId === 'user_002');
  });

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
      .post<{
        name: string;
      }>(
        `https://ngfeed-fefed-default-rtdb.europe-west1.firebasedatabase.app/posts.json?auth=${token}`,
        {},
      )
      .pipe(
        switchMap((response) => {
          const postId = response.name;

          const newPost: Post = {
            ...post,
            id: postId,
            likesCount: 0,
            commentsCount: 0,
          };

          const updates: any = {
            [`posts/${postId}`]: {
              ...post,
              created_at: new Date().toISOString(),
              likesCount: 0,
              commentsCount: 0,
            },
            [`user-posts/${post.userId}/${postId}`]: true,
          };

          return this.http
            .patch(
              `https://ngfeed-fefed-default-rtdb.europe-west1.firebasedatabase.app/.json?auth=${token}`,
              updates,
            )
            .pipe(map(() => newPost));
        }),
        delay(500), // delay artificiale per loading ui
        tap((newPost) => {
          console.log('New Post:', newPost);
          console.log('Current authUserPosts:', this.authUserPosts());
          this.allPosts.update((posts) => [newPost, ...posts]);
          this.authUserPosts.update((posts) => [newPost, ...posts]);
        }),
        catchError((error) => {
          return throwError(() => new Error('Post creation failed'));
        }),
      );
  }

  updatePost(postId: string, post: EditedPost) {
    // return this.editPost(
    //   `https://ngfeed-fefed-default-rtdb.europe-west1.firebasedatabase.app/posts/${postId}.json`,
    //   post,
    // ).pipe(
    //   delay(2000),
    //   tap((updatedPost) => {
    //     // Aggiorna il segnale locale così la UI reagisce immediatamente
    //     this.currentUserPosts.update((posts) => {
    //       const index = posts.findIndex((p) => p.id === postId);
    //       if (index !== -1) {
    //         // Uniamo l'ID esistente con i nuovi dati
    //         posts[index] = { ...post, id: postId } as Post;
    //       }
    //       return [...posts];
    //     });
    //   }),
    //   catchError((error) => {
    //     // Rollback in caso di errore
    //     return throwError(() => new Error('Richiesta fallita!'));
    //   }),
    // );
  }

  deletePost(postId: string) {
    // const oldPosts = this.currentUserPosts();
    // this.currentUserPosts.update((posts) => posts.filter((post) => post.id !== postId));
    // return this.http
    //   .delete(
    //     `https://ngfeed-fefed-default-rtdb.europe-west1.firebasedatabase.app/posts/${postId}.json`,
    //   )
    //   .pipe(
    //     delay(1000),
    //     tap(() => {
    //       console.log(`Post ${postId} eliminato con successo`);
    //       this.currentUserPosts.update((posts) => posts.filter((post) => post.id !== postId));
    //     }),
    //     catchError((error) => {
    //       // this.currentUserPosts.set(oldPosts);
    //       return throwError(() => new Error('Delete request failed'));
    //     }),
    //   );
  }

  // utility
  private fetchPosts(url: string) {
    return this.http.get<{
      [key: string]: FirebasePost;
    }>(url);
  }

  // utility
  private storePost(url: string, post: FirebasePost) {
    return this.http.post(url, post);
  }

  // utility
  private editPost(url: string, post: EditedPost) {
    return this.http.patch(url, post);
  }
}
