import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FeedSkeleton } from '@/shared/components/skeletons/feed-skeleton/feed-skeleton';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { BlogPost } from '@/features/posts/post/post';
import { PostService } from '@/core/services/post.service';

@Component({
  selector: 'app-followed',
  imports: [FeedSkeleton, BlogPost],
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
