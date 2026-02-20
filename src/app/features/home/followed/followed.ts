import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { BlogPost } from '@/features/posts/post/post';
import { PostService } from '@/core/services/post.service';
import { AuthService } from '@/core/services/auth.service';
import { UserService } from '@/core/services/user.service';

@Component({
  selector: 'app-followed',
  imports: [BlogPost],
  templateUrl: './followed.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Followed {
  private authService = inject(AuthService);
  private postService = inject(PostService);
  private userService = inject(UserService);

  authenticatedUser = this.authService.authenticatedUser;
  savedPostsIds = this.postService.loadedSavedPostsIds;
  likedPostsIds = computed(() => this.postService.loadedLikedPostsIds());
  readonly savedSet = computed(() => new Set(this.savedPostsIds()));
  readonly likedSet = computed(() => new Set(this.likedPostsIds()));
  posts = computed(() =>
    this.postService
      .allLoadedPosts()
      .filter((post) => this.userService.loadedFollowedIds().includes(post.userId)),
  );
}
