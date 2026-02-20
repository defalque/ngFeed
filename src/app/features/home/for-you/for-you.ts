import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { BlogPost } from '../../posts/post/post';
import { PostService } from '@/core/services/post.service';
import { AuthService } from '@/core/services/auth.service';

@Component({
  selector: 'app-for-you',
  imports: [BlogPost],
  templateUrl: './for-you.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForYou {
  private authService = inject(AuthService);
  private postService = inject(PostService);

  authenticatedUser = this.authService.authenticatedUser;
  savedPostsIds = this.postService.loadedSavedPostsIds;
  likedPostsIds = computed(() => this.postService.loadedLikedPostsIds());
  readonly savedSet = computed(() => new Set(this.savedPostsIds()));
  readonly likedSet = computed(() => new Set(this.likedPostsIds()));
  posts = computed(() =>
    this.postService
      .allLoadedPosts()
      .filter((post) => post.userId !== this.authenticatedUser()?.localId),
  );
}
