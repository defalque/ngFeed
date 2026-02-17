import { Component, computed, DestroyRef, inject, signal } from '@angular/core';
import { FeedSkeleton } from '@/shared/components/skeletons/feed-skeleton/feed-skeleton';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { BlogPost } from '@/features/posts/post/post';
import { PostService } from '@/core/services/post.service';
import { AuthService } from '@/core/services/auth.service';

@Component({
  selector: 'app-followed',
  imports: [BlogPost],
  templateUrl: './followed.html',
})
export class Followed {
  private authService = inject(AuthService);
  private postService = inject(PostService);

  posts = computed(() => this.postService.followedPosts());
}
