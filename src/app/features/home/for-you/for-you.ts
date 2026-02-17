import { Component, computed, inject } from '@angular/core';
import { BlogPost } from '../../posts/post/post';
import { PostService } from '@/core/services/post.service';
import { AuthService } from '@/core/services/auth.service';

@Component({
  selector: 'app-for-you',
  imports: [BlogPost],
  templateUrl: './for-you.html',
})
export class ForYou {
  private authService = inject(AuthService);
  private postService = inject(PostService);

  currentUser = this.authService.authenticatedUser;

  posts = computed(() => this.postService.allLoadedPosts());
}
