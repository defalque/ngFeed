import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { FeedPost } from './feed-post/feed-post';
import { PostService } from '@/post.service';

@Component({
  selector: 'app-feed',
  imports: [FeedPost],
  templateUrl: './feed.html',
})
export class Feed implements OnInit {
  private postService = inject(PostService);
  posts = this.postService.loadedPosts;

  error = signal('');
  isFetching = signal(false);

  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.isFetching.set(true);
    const sub = this.postService.fetchForYouPosts().subscribe({
      error: (error: Error) => {
        console.log(error);
        this.error.set(error.message);
      },
      complete: () => {
        this.isFetching.set(false);
      },
    });

    this.destroyRef.onDestroy(() => {
      sub.unsubscribe();
    });
  }
}
