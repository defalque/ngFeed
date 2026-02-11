import { PostService } from '@/post.service';
import { Component, DestroyRef, effect, inject, input, OnInit, signal } from '@angular/core';
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
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { Title } from '@angular/platform-browser';
// import { ResolveFn } from '@angular/router';
// import { Post } from '@/models/post.model';

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
  private titleService = inject(Title);

  readonly HeartIcon = HeartIcon;
  readonly MessageCircleIcon = MessageCircleIcon;
  readonly RefreshCcw = RefreshCcw;
  readonly EllipsisIcon = EllipsisIcon;
  readonly BookmarkIcon = BookmarkIcon;
  readonly ThumbsDownIcon = ThumbsDownIcon;
  readonly MessageSquareWarningIcon = MessageSquareWarningIcon;
  readonly TrashIcon = TrashIcon;
  readonly PencilIcon = PencilIcon;

  id = input.required<string>();
  postId = input.required<string>();

  private route = inject(ActivatedRoute);

  private postService = inject(PostService);
  post = this.postService.loadedPost;

  private userService = inject(UserService);
  currentUser = this.userService.loadedCurrentUser;

  isFetching = signal(false);

  private destroyRef = inject(DestroyRef);

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

  ngOnInit(): void {
    const sub = this.route.params.subscribe((params) => {
      const userId = params['id'];
      const postId = params['postId'];
      const currentUserId = this.userService.loadedCurrentUser()?.id;

      // Determina quale array controllare
      const postsArray =
        userId === currentUserId
          ? this.postService.loadedUserPosts()
          : this.postService.loadedPosts();

      // Se l’array è vuoto → fetch
      if (!postsArray?.length) {
        console.log('post not cached, fetching...');
        this.loadPost(postId);
        return;
      }

      // Cerca il post
      const foundPost = postsArray.find((p) => p.id === postId);
      if (foundPost) {
        this.postService.setLoadedPost(foundPost);
      } else {
        // post non in cache, fetch
        this.loadPost(postId);
      }
    });

    this.destroyRef.onDestroy(() => {
      sub.unsubscribe();
    });
  }

  private loadPost(postId: string) {
    this.isFetching.set(true);
    this.postService
      .fetchPost(postId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isFetching.set(false)),
      )
      .subscribe({
        error: (error: Error) => console.log(console.log(error.message)),
      });
  }

  isCurrentUserFeed() {
    return this.id() === this.currentUser()?.id;
  }

  currentOptionsOpen = signal<string | null>(null);

  setCurrentOptionsOpen(postId: string | null) {
    this.currentOptionsOpen.set(postId);
  }
}

// export const postResolver: ResolveFn<Post | undefined> = (route) => {
//   const postService = inject(PostService);
//   const userService = inject(UserService);

//   const userId = route.params['id'];
//   const postId = route.params['postId'];

//   if (userId === userService.loadedCurrentUser()?.id) {
//     return postService.loadedUserPosts().find((post) => post.id === postId);
//   }

//   return postService.loadedPosts().find((post) => post.id === postId);
// };
