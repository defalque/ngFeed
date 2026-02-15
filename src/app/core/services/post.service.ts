import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, delay, map, tap, throwError } from 'rxjs';
import { EditedPost, FirebasePost, NewPost, Post } from '@/core/types/post.model';
import { UserService } from './user.service';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private http = inject(HttpClient);
  private userService = inject(UserService);

  currentUserId = this.userService.loadedCurrentUser()?.id;

  private posts = signal<Post[]>([]);
  loadedPosts = this.posts.asReadonly();

  private currentUserPosts = signal<Post[]>([]);
  loadedCurrentUserPosts = this.currentUserPosts.asReadonly();

  private userPosts = signal<Post[]>([]);
  loadedUserPosts = this.userPosts.asReadonly();

  setUserPosts(posts: Post[]) {
    this.userPosts.set(posts);
  }

  private post = signal<Post | null>(null);
  loadedPost = this.post.asReadonly();

  setLoadedPost(post: Post | null) {
    this.post.set(post);
  }

  private readonly postsUrl =
    'https://ngfeed-fefed-default-rtdb.europe-west1.firebasedatabase.app/posts.json';
  private readonly followedPostsUrl =
    'https://ngfeed-fefed-default-rtdb.europe-west1.firebasedatabase.app/posts.json?orderBy="userId"&equalTo="user_002"';

  fetchForYouPosts(userId: string) {
    return this.fetchPosts(this.postsUrl).pipe(
      map((res) => {
        if (!res) return [];

        const posts: Post[] = [];
        for (const key in res) {
          if (Object.prototype.hasOwnProperty.call(res, key)) {
            if (res[key].userId !== userId)
              posts.push({
                id: key, // ID preso dalla key di Firebase
                ...res[key], // dati senza id
              });
          }
        }
        return posts;
      }),
      tap((posts) => this.posts.set(posts)), // per eseguire side effects
      delay(500), // delay artificiale per mostrare loading ui;
    );
  }

  fetchFollowedPosts() {
    return this.fetchPosts(this.followedPostsUrl).pipe(
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
      tap((posts) => this.posts.set(posts)), // per eseguire side effects
      delay(500), // delay artificiale per mostrare loading ui;
    );
  }

  fetchUserPosts(id: string) {
    return this.fetchPosts(
      `https://ngfeed-fefed-default-rtdb.europe-west1.firebasedatabase.app/posts.json?orderBy="userId"&equalTo="${id}"`,
    ).pipe(
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
        // --- AGGIUNGI L'ORDINAMENTO QUI ---
        // Ordine decrescente (più recente in alto)
        return posts.sort((a, b) => {
          const dateA = new Date(a.created_at).getTime();
          const dateB = new Date(b.created_at).getTime();
          return dateB - dateA;
        });
      }),
      tap((posts) => {
        if (this.currentUserId === id) {
          this.currentUserPosts.set(posts);
        }
        this.userPosts.set(posts);
      }), // per eseguire side effects
      delay(500),
    );
  }

  fetchPost(postId: string) {
    return this.fetchPosts(
      `https://ngfeed-fefed-default-rtdb.europe-west1.firebasedatabase.app/posts/${postId}.json`,
    ).pipe(
      map((res) => {
        if (!res) return null;

        return { id: postId, ...res } as Post;
      }),
      tap((post) => {
        if (post) this.post.set(post);
      }), // per eseguire side effects
      delay(500), // delay artificiale per mostrare loading ui;
    );
  }

  createPost(post: NewPost) {
    // const oldPosts = this.currentUserPosts();

    // // 1. Creiamo un oggetto "temporaneo" con un ID fittizio per la UI
    // const tempId = Date.now().toString(); // O un UUID
    // const tempPost: Post = { ...post, id: tempId, likesCount: 0, commentsCount: 0 };

    // // 2. Aggiornamento ottimistico della UI
    // this.currentUserPosts.set([tempPost, ...oldPosts]);

    // 3. Invio al server (senza l'id temporaneo)
    return this.storePost(this.postsUrl, { ...post, likesCount: 0, commentsCount: 0 }).pipe(
      delay(2000),
      tap((response: any) => {
        const realId = response.name;

        // // Sostituiamo il post temporaneo con quello reale (che ha l'ID vero)
        // this.currentUserPosts.update((posts) =>
        //   posts.map((p) =>
        //     p.id === tempId ? { ...post, likesCount: 0, commentsCount: 0, id: realId } : p,
        //   ),
        // );const realId = response.name;

        const newPost: Post = {
          ...post,
          id: realId,
          likesCount: 0,
          commentsCount: 0,
        };

        this.currentUserPosts.update((posts) => [newPost, ...posts]);
      }),
      catchError((error) => {
        // Rollback in caso di errore
        return throwError(() => new Error('Richiesta fallita!'));
      }),
    );
  }

  updatePost(postId: string, post: EditedPost) {
    return this.editPost(
      `https://ngfeed-fefed-default-rtdb.europe-west1.firebasedatabase.app/posts/${postId}.json`,
      post,
    ).pipe(
      delay(2000),
      tap((updatedPost) => {
        // Aggiorna il segnale locale così la UI reagisce immediatamente
        this.currentUserPosts.update((posts) => {
          const index = posts.findIndex((p) => p.id === postId);
          if (index !== -1) {
            // Uniamo l'ID esistente con i nuovi dati
            posts[index] = { ...post, id: postId } as Post;
          }
          return [...posts];
        });
      }),
      catchError((error) => {
        // Rollback in caso di errore
        return throwError(() => new Error('Richiesta fallita!'));
      }),
    );
  }

  deletePost(postId: string) {
    // const oldPosts = this.currentUserPosts();
    // this.currentUserPosts.update((posts) => posts.filter((post) => post.id !== postId));

    return this.http
      .delete(
        `https://ngfeed-fefed-default-rtdb.europe-west1.firebasedatabase.app/posts/${postId}.json`,
      )
      .pipe(
        delay(1000),
        tap(() => {
          console.log(`Post ${postId} eliminato con successo`);
          this.currentUserPosts.update((posts) => posts.filter((post) => post.id !== postId));
        }),
        catchError((error) => {
          // this.currentUserPosts.set(oldPosts);
          return throwError(() => new Error('Delete request failed'));
        }),
      );
  }

  private fetchPosts(url: string) {
    return this.http.get<{
      [key: string]: FirebasePost;
    }>(url);
  }

  private storePost(url: string, post: FirebasePost) {
    return this.http.post(url, post);
  }

  private editPost(url: string, post: EditedPost) {
    return this.http.patch(url, post);
  }
}
