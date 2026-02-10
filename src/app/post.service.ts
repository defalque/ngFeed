import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { delay, map, tap } from 'rxjs';
import { Post } from '@/models/post.model';

@Injectable({
  providedIn: 'root',
})
export class PostService {
  private http = inject(HttpClient);

  private posts = signal<Post[]>([]);
  loadedPosts = this.posts.asReadonly();

  private currentUserPosts = signal<Post[]>([]);
  loadedCurrentUserPosts = this.currentUserPosts.asReadonly();

  private userPosts = signal<Post[]>([]);
  loadedUserPosts = this.userPosts.asReadonly();

  private post = signal<Post | null>(null);
  loadedPost = this.post.asReadonly();

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
        console.log(posts);
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
        return posts;
      }),
      tap((posts) => this.userPosts.set(posts)), // per eseguire side effects
      delay(500), // delay artificiale per mostrare loading ui;
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

  private fetchPosts(url: string) {
    return this.http.get<{
      [key: string]: Omit<Post, 'id'>;
    }>(url);
  }
}
