import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FeedPost } from './feed-post/feed-post';
import { PostService } from '@/post.service';
import { UserService } from '@/user.service';
import { FeedSkeleton } from '@/ui/skeletons/feed-skeleton/feed-skeleton';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-feed',
  imports: [FeedPost, FeedSkeleton],
  templateUrl: './feed.html',
})
export class Feed {
  private postService = inject(PostService);
  posts = this.postService.loadedPosts;

  private userService = inject(UserService);

  error = signal('');
  isFetching = signal(false);

  private destroyRef = inject(DestroyRef);

  ngOnInit() {
    this.isFetching.set(true);
    const user = this.userService.loadedCurrentUser();

    if (user) {
      this.postService
        .fetchForYouPosts(user.id)
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
    } else {
      this.userService
        .fetchCurrentUser()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((user) => {
          if (user)
            this.postService
              .fetchForYouPosts(user.id)
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
        });
    }
  }

  currentOptionsOpen = signal<string | null>(null);

  setCurrentOptionsOpen(postId: string | null) {
    this.currentOptionsOpen.set(postId);
  }
}
