import { Component, DestroyRef, inject, input, signal } from '@angular/core';
import { FeedPost } from '@/home/feed/feed-post/feed-post';
import { PostService } from '@/post.service';
import { UserService } from '@/user.service';
import { UserFeedSkeleton } from '@/ui/skeletons/user-feed-skeleton/user-feed-skeleton';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-your-feeds',
  imports: [FeedPost, UserFeedSkeleton],
  templateUrl: './your-feeds.html',
  styleUrl: './your-feeds.css',
})
export class YourFeeds {
  private route = inject(ActivatedRoute);
  private postService = inject(PostService);
  private userService = inject(UserService);
  private destroyRef = inject(DestroyRef);

  id = input.required<string>();

  error = signal('');
  isFetching = signal(false);

  loadedUserPosts = this.postService.loadedUserPosts;
  loadedCurrentUserPosts = this.postService.loadedCurrentUserPosts;

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      if (
        params.get('id') === this.userService.loadedCurrentUser()?.id &&
        this.loadedCurrentUserPosts().length
      ) {
        this.postService.setUserPosts(this.loadedCurrentUserPosts());
        return;
      }
      this.loadUserFeeds(params.get('id')!);
    });
  }

  private loadUserFeeds(userId: string) {
    this.isFetching.set(true);
    this.postService
      .fetchUserPosts(userId)
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

  isCurrentUserPosts() {
    return this.id() === this.userService.loadedCurrentUser()?.id;
  }
}
