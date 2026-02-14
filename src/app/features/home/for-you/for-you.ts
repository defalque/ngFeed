import { Component, DestroyRef, inject, signal } from '@angular/core';
import { BlogPost } from '../../posts/post/post';
import { FeedSkeleton } from '@/shared/components/skeletons/feed-skeleton/feed-skeleton';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PostService } from '@/core/services/post.service';
import { UserService } from '@/core/services/user.service';

@Component({
  selector: 'app-for-you',
  imports: [FeedSkeleton, BlogPost],
  templateUrl: './for-you.html',
})
export class ForYou {
  private postService = inject(PostService);
  private userService = inject(UserService);
  private destroyRef = inject(DestroyRef);

  error = signal('');
  isFetching = signal(false);

  posts = this.postService.loadedPosts;

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
}
