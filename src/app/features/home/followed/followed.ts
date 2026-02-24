import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { BlogPost } from '@/features/posts/post/post';
import { PostService } from '@/core/services/post.service';
import { AuthService } from '@/core/services/auth.service';
import { UserService } from '@/core/services/user.service';

@Component({
  selector: 'app-followed',
  imports: [BlogPost],
  templateUrl: './followed.html',
  styleUrl: './followed.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Followed {
  private authService = inject(AuthService);
  private postService = inject(PostService);
  private userService = inject(UserService);

  authenticatedUser = this.authService.authenticatedUser;

  savedPostsIds = this.postService.loadedSavedPostsIds;
  likedPostsIds = this.postService.loadedLikedPostsIds;
  readonly savedSet = computed(() => new Set(this.savedPostsIds()));
  readonly likedSet = computed(() => new Set(this.likedPostsIds()));

  posts = computed(() => {
    const followedSet = new Set(this.userService.loadedFollowedIds());
    return this.postService.allLoadedPosts().filter((post) => followedSet.has(post.userId));
  });
}
