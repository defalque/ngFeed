import { PostService } from '@/post.service';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FeedPost } from '@/home/feed/feed-post/feed-post';
import { FullFeedSkeleton } from '@/ui/skeletons/full-feed-skeleton/full-feed-skeleton';
import {
  EllipsisIcon,
  HeartIcon,
  MessageCircleIcon,
  RefreshCcw,
  BookmarkIcon,
  ThumbsDownIcon,
  MessageSquareWarningIcon,
  TrashIcon,
  PencilIcon,
  LucideAngularModule,
} from 'lucide-angular';
import { UserService } from '@/user.service';

@Component({
  selector: 'app-full-feed',
  imports: [FeedPost, FullFeedSkeleton, LucideAngularModule],
  templateUrl: './full-feed.html',
  styleUrl: './full-feed.css',
  host: {
    class: 'block w-full',
  },
})
export class FullFeed implements OnInit {
  readonly HeartIcon = HeartIcon;
  readonly MessageCircleIcon = MessageCircleIcon;
  readonly RefreshCcw = RefreshCcw;
  readonly EllipsisIcon = EllipsisIcon;
  readonly BookmarkIcon = BookmarkIcon;
  readonly ThumbsDownIcon = ThumbsDownIcon;
  readonly MessageSquareWarningIcon = MessageSquareWarningIcon;
  readonly TrashIcon = TrashIcon;
  readonly PencilIcon = PencilIcon;

  userId!: string;
  postId!: string;
  private route = inject(ActivatedRoute);

  postService = inject(PostService);
  post = this.postService.loadedPost;

  userService = inject(UserService);
  currentUser = this.userService.loadedCurrentUser;

  isFetching = signal(false);

  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.postId = params.get('postId')!;
      this.userId = params.get('id')!;
      this.loadPost(this.postId);
    });
  }

  loadPost(postId: string) {
    this.isFetching.set(true);
    const sub = this.postService.fetchPost(postId).subscribe({
      error: (error: Error) => console.log(console.log(error.message)),
      complete: () => this.isFetching.set(false),
    });

    this.destroyRef.onDestroy(() => {
      sub.unsubscribe();
    });
  }

  isCurrentUserFeed() {
    return this.userId === this.currentUser()?.id;
  }

  currentOptionsOpen = signal<string | null>(null);

  setCurrentOptionsOpen(postId: string | null) {
    this.currentOptionsOpen.set(postId);
  }
}
