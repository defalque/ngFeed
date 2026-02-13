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
  LucideAngularModule,
} from 'lucide-angular';
import { UserService } from '@/user.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { VerifiedIcon } from '@/icons/verified-icon/verified-icon';

@Component({
  selector: 'app-full-feed',
  imports: [FeedPost, FullFeedSkeleton, LucideAngularModule, VerifiedIcon],
  templateUrl: './full-feed.html',
  styleUrl: './full-feed.css',
  host: {
    class: 'block w-full',
  },
})
export class FullFeed implements OnInit {
  private titleService = inject(Title);
  private route = inject(ActivatedRoute);
  private postService = inject(PostService);
  private userService = inject(UserService);
  private destroyRef = inject(DestroyRef);

  id = input.required<string>();
  postId = input.required<string>();

  isFetching = signal(false);

  post = this.postService.loadedPost;
  currentUser = this.userService.loadedCurrentUser;

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
          ? this.postService.loadedCurrentUserPosts()
          : this.postService.loadedPosts();

      // Se l’array è vuoto → fetch
      if (!postsArray?.length) {
        console.log('post not cached, fetching...');
        // if (currentUserId === userId) {
        //   this.loadPosts(currentUserId!);
        // }
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
    console.log('fetching');
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

  private loadPosts(userId: string) {
    console.log('fetching');

    this.isFetching.set(true);
    this.postService
      .fetchUserPosts(userId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isFetching.set(false)),
      )
      .subscribe({
        error: (error: Error) => console.log(console.log(error.message)),
      });
  }

  isCurrentUserPost() {
    return this.id() === this.currentUser()?.id;
  }

  readonly HeartIcon = HeartIcon;
  readonly MessageCircleIcon = MessageCircleIcon;
  readonly RefreshCcw = RefreshCcw;
  readonly EllipsisIcon = EllipsisIcon;
}
