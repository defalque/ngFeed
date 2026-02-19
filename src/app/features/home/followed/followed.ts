import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { FeedSkeleton } from '@/shared/components/skeletons/feed-skeleton/feed-skeleton';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { BlogPost } from '@/features/posts/post/post';
import { PostService } from '@/core/services/post.service';
import { AuthService } from '@/core/services/auth.service';
import { UserService } from '@/core/services/user.service';

@Component({
  selector: 'app-followed',
  imports: [BlogPost],
  templateUrl: './followed.html',
})
export class Followed {
  private authService = inject(AuthService);
  private postService = inject(PostService);
  private userService = inject(UserService);

  authenticatedUser = this.authService.authenticatedUser;
  savedPostsIds = this.postService.loadedSavedPostsIds;

  posts = computed(() =>
    this.postService
      .allLoadedPosts()
      .filter((post) => this.userService.loadedFollowedIds().includes(post.userId)),
  );

  isSavedPost = (postId: string) => this.savedPostsIds().includes(postId);
}
