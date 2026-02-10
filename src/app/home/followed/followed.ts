import { Component, DestroyRef, inject, input, output, signal } from '@angular/core';
import { FeedPost } from '../feed/feed-post/feed-post';
import { PostService } from '@/post.service';
import { FeedSkeleton } from '@/ui/skeletons/feed-skeleton/feed-skeleton';

@Component({
  selector: 'app-followed',
  imports: [FeedPost, FeedSkeleton],
  templateUrl: './followed.html',
})
export class Followed {
  postService = inject(PostService);
  posts = this.postService.loadedPosts;

  error = signal('');
  isFetching = signal(false);

  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.isFetching.set(true);
    const sub = this.postService.fetchFollowedPosts().subscribe({
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

  currentOptionsOpen = signal<string | null>(null);

  setCurrentOptionsOpen(postId: string | null) {
    this.currentOptionsOpen.set(postId);
  }
}
