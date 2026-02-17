import { Component, computed, effect, inject, input } from '@angular/core';
import {
  EllipsisIcon,
  HeartIcon,
  MessageCircleIcon,
  RefreshCcw,
  LucideAngularModule,
} from 'lucide-angular';
import { Title } from '@angular/platform-browser';
import { VerifiedIcon } from '@/shared/components/verified-icon/verified-icon';
import { PostService } from '@/core/services/post.service';
import { BlogPost } from '../post/post';
import { AuthService } from '@/core/services/auth.service';

@Component({
  selector: 'app-full-post',
  imports: [BlogPost, LucideAngularModule, VerifiedIcon],
  templateUrl: './full-post.html',
  styleUrl: './full-post.css',
  host: {
    class: 'block w-full',
  },
})
export class FullPost {
  private titleService = inject(Title);
  private postService = inject(PostService);
  private authService = inject(AuthService);

  id = input.required<string>();
  postId = input.required<string>();

  post = computed(() => {
    if (this.isCurrentUserPost()) {
      return this.postService
        .authUserPostsReadonly()
        .find((p) => p.id === this.postId() && p.userId === this.id());
    } else {
      return this.postService
        .allLoadedPosts()
        .find((p) => p.id === this.postId() && p.userId === this.id());
    }
  });

  constructor() {
    effect(() => {
      const postData = this.post();
      if (postData) {
        const fullTitle = `${postData.title}`.trim();
        this.titleService.setTitle(fullTitle);
      } else {
        this.titleService.setTitle('Caricamento...');
      }
    });
  }

  isCurrentUserPost() {
    return this.id() === this.authService.authenticatedUser()?.localId;
  }

  readonly HeartIcon = HeartIcon;
  readonly MessageCircleIcon = MessageCircleIcon;
  readonly RefreshCcw = RefreshCcw;
  readonly EllipsisIcon = EllipsisIcon;
}
