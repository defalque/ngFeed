import { Component, DestroyRef, inject, signal } from '@angular/core';
import { FeedPost } from './feed-post/feed-post';
import { PostService } from '@/post.service';
import { UserService } from '@/user.service';
import { FeedSkeleton } from '@/ui/skeletons/feed-skeleton/feed-skeleton';

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
      this.postService.fetchForYouPosts(user.id).subscribe({
        error: (error: Error) => {
          console.log(error);
          this.error.set(error.message);
        },
        complete: () => {
          this.isFetching.set(false);
        },
      });
    } else {
      this.userService.fetchCurrentUser().subscribe((user) => {
        if (user)
          this.postService.fetchForYouPosts(user.id).subscribe({
            error: (error: Error) => {
              console.log(error);
              this.error.set(error.message);
            },
            complete: () => {
              this.isFetching.set(false);
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
