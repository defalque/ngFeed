import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FeedPost } from '@/home/feed/feed-post/feed-post';
import { PostService } from '@/post.service';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '@/user.service';
import { UserFeedSkeleton } from '@/ui/skeletons/user-feed-skeleton/user-feed-skeleton';

@Component({
  selector: 'app-your-feeds',
  imports: [FeedPost, UserFeedSkeleton],
  templateUrl: './your-feeds.html',
  styleUrl: './your-feeds.css',
})
export class YourFeeds {
  userId!: string;

  private route = inject(ActivatedRoute);

  private postService = inject(PostService);
  private userService = inject(UserService);
  loadedUserPosts = this.postService.loadedUserPosts;

  error = signal('');
  isFetching = signal(false);

  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.userId = params.get('id')!;
      this.loadUserFeeds(this.userId);
    });
  }

  loadUserFeeds(userId: string) {
    this.isFetching.set(true);
    const sub = this.postService.fetchUserPosts(userId).subscribe({
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
    // }
  }

  isCurrentUserFeeds() {
    return this.userId === this.userService.loadedCurrentUser()?.id;
  }

  currentOptionsOpen = signal<string | null>(null);

  setCurrentOptionsOpen(postId: string | null) {
    this.currentOptionsOpen.set(postId);
  }
}
