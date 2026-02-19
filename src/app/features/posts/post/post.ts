import { Component, input, signal } from '@angular/core';
import { Post } from '@/core/types/post.model';
import { RouterLink } from '@angular/router';
import { PostActions } from '@/features/posts/post-actions/post-actions';
import { VerifiedIcon } from '@/shared/components/verified-icon/verified-icon';
import { PostOptions } from '../post-options/post-options';

@Component({
  selector: 'app-post',
  imports: [RouterLink, PostActions, PostOptions, VerifiedIcon],
  templateUrl: './post.html',
  styleUrl: './post.css',
})
export class BlogPost {
  isSavedPost = input.required<boolean>();
  type = input.required<'for-you' | 'user-posts' | 'full-post'>();
  post = input.required<Post>();
  currentUserPost = input.required<boolean>();

  currentOptionsOpen = signal<string | null>(null);

  setCurrentOptionsOpen = (postId: string | null) => {
    this.currentOptionsOpen.set(postId);
  };
}
