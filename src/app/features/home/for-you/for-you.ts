import { Component, computed, inject } from '@angular/core';
import { BlogPost } from '../../posts/post/post';
import { PostService } from '@/core/services/post.service';
import { AuthService } from '@/core/services/auth.service';
import { UserService } from '@/core/services/user.service';

@Component({
  selector: 'app-for-you',
  imports: [BlogPost],
  templateUrl: './for-you.html',
})
export class ForYou {
  private authService = inject(AuthService);
  private postService = inject(PostService);
  private userService = inject(UserService);

  authenticatedUser = this.authService.authenticatedUser;
  savedPostsIds = this.postService.loadedSavedPostsIds;

  posts = computed(() =>
    this.postService
      .allLoadedPosts()
      .filter((post) => post.userId !== this.authenticatedUser()?.localId),
  );

  isSavedPost = (postId: string) => this.savedPostsIds().includes(postId);

  // fetchare sempre i post
}
