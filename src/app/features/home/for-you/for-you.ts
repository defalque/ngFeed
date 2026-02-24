import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { BlogPost } from '../../posts/post/post';
import { PostService } from '@/core/services/post.service';
import { AuthService } from '@/core/services/auth.service';
import { EmptyWrapper } from '@/shared/components/empty-wrapper/empty-wrapper';

@Component({
  selector: 'app-for-you',
  imports: [BlogPost, EmptyWrapper],
  templateUrl: './for-you.html',
  styleUrl: './for-you.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ForYou {
  private authService = inject(AuthService);
  private postService = inject(PostService);

  authenticatedUser = this.authService.authenticatedUser;

  savedPostsIds = this.postService.loadedSavedPostsIds;
  likedPostsIds = this.postService.loadedLikedPostsIds;
  readonly savedSet = computed(() => new Set(this.savedPostsIds()));
  readonly likedSet = computed(() => new Set(this.likedPostsIds()));

  posts = computed(() =>
    this.postService
      .allLoadedPosts()
      .filter((post) => post.userId !== this.authenticatedUser()?.localId),
  );
}
