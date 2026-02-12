import { Component, DestroyRef, inject, input, output, signal } from '@angular/core';
import { FeedPost } from '../feed/feed-post/feed-post';
import { PostService } from '@/post.service';
import { FeedSkeleton } from '@/ui/skeletons/feed-skeleton/feed-skeleton';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-followed',
  imports: [FeedPost, FeedSkeleton],
  templateUrl: './followed.html',
})
export class Followed {
  postService = inject(PostService);
  private destroyRef = inject(DestroyRef);

  error = signal('');
  isFetching = signal(false);

  posts = this.postService.loadedPosts;

  ngOnInit(): void {
    this.isFetching.set(true);
    this.postService
      .fetchFollowedPosts()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isFetching.set(false)),
      )
      .subscribe({
        error: (error: Error) => {
          console.log(error);
          this.error.set(error.message);
        },
      });
  }
}
