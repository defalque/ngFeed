import { Component, input, signal } from '@angular/core';
import { Post } from '@/models/post.model';
import { RouterLink } from '@angular/router';
import { PostActions } from '@/shared/post-actions/post-actions';
import { PostOptions } from '@/shared/post-options/post-options';
import { VerifiedIcon } from '@/icons/verified-icon/verified-icon';

@Component({
  selector: 'app-feed-post',
  imports: [RouterLink, PostActions, PostOptions, VerifiedIcon],
  templateUrl: './feed-post.html',
  styleUrl: './feed-post.css',
})
export class FeedPost {
  type = input.required<'feed' | 'your-feed' | 'full-feed'>();
  post = input.required<Post>();
  currentUserFeeds = input.required<boolean>();

  ngOnInit() {
    console.log(this.currentUserFeeds());
  }

  currentOptionsOpen = signal<string | null>(null);

  setCurrentOptionsOpen = (postId: string | null) => {
    this.currentOptionsOpen.set(postId);
  };
}
