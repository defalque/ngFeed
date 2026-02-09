import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FeedPost } from '@/home/feed/feed-post/feed-post';
import { PostService } from '@/post.service';

@Component({
  selector: 'app-your-feeds',
  imports: [FeedPost],
  templateUrl: './your-feeds.html',
  styleUrl: './your-feeds.css',
})
export class YourFeeds {
  private postService = inject(PostService);
  loadedCurrentUserPosts = this.postService.loadedCurrentUserPosts;

  error = signal('');
  isFetching = signal(false);

  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.isFetching.set(true);
    const sub = this.postService.fetchCurrentUserPosts().subscribe({
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
