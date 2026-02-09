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

  private readonly postsUrl =
    'https://ngfeed-fefed-default-rtdb.europe-west1.firebasedatabase.app/posts.json';
  private readonly followedPostsUrl =
    'https://ngfeed-fefed-default-rtdb.europe-west1.firebasedatabase.app/posts.json?orderBy="userId"&equalTo="user_002"';
  private readonly currentUserPostsUrl =
    'https://ngfeed-fefed-default-rtdb.europe-west1.firebasedatabase.app/posts.json?orderBy="userId"&equalTo="user_006"';

  fetchForYouPosts() {
    return this.fetchPosts(this.postsUrl).pipe(
      map((res) => {
        if (!res) return [];

        const posts: Post[] = [];
        for (const key in res) {
          if (Object.prototype.hasOwnProperty.call(res, key)) {
            if (res[key].userId !== 'user_006')
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
      delay(1000), // delay artificiale per mostrare loading ui;
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
      delay(1000), // delay artificiale per mostrare loading ui;
    );
  }

  fetchCurrentUserPosts() {
    return this.fetchPosts(this.currentUserPostsUrl).pipe(
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
        return [];
      }),
      tap((posts) => this.currentUserPosts.set(posts)), // per eseguire side effects
      delay(1000), // delay artificiale per mostrare loading ui;
    );
  }

  private fetchPosts(url: string) {
    return this.http.get<{
      [key: string]: Omit<Post, 'id'>;
    }>(url);
  }
}
