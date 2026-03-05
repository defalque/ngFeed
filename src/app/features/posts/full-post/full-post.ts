import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
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
import { Router } from '@angular/router';
import { UserService } from '@/core/services/user.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { FullPostSkeleton } from '@/shared/components/skeletons/full-post-skeleton/full-post-skeleton';

@Component({
  selector: 'app-full-post',
  imports: [BlogPost, LucideAngularModule, VerifiedIcon, FullPostSkeleton],
  templateUrl: './full-post.html',
  styleUrl: './full-post.css',
  host: { class: 'block w-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FullPost implements OnInit {
  private titleService = inject(Title);
  private postService = inject(PostService);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);

  id = input.required<string>();
  postId = input.required<string>();

  isFetching = signal(false);
  error = signal('');
  savedPostsIds = this.postService.loadedSavedPostsIds;
  likedPostsIds = this.postService.loadedLikedPostsIds;
  readonly savedSet = computed(() => new Set(this.savedPostsIds()));
  readonly likedSet = computed(() => new Set(this.likedPostsIds()));

  // Segnale derivato per il post corrente
  post = computed(() => {
    const currentUserId = this.authService.authenticatedUser()?.localId;
    const postId = this.postId();
    const userId = this.id();

    if (currentUserId === userId) {
      // Post dell'utente autenticato
      const inAuthPosts = this.postService
        .authUserPostsReadonly()
        .find((p) => p.id === postId && p.userId === currentUserId);
      if (inAuthPosts) return inAuthPosts;

      const userPost = this.postService.userPostReadonly();
      if (userPost) return userPost;

      const inAllLoadedPosts = this.postService
        .allLoadedPosts()
        .find((p) => p.id === postId && p.userId === userId);
      if (inAllLoadedPosts) return inAllLoadedPosts;

      return null;
    }

    // Post di altri utenti
    const inGenericPosts = this.postService
      .genericUserPostsReadonly()
      .find((p) => p.id === postId && p.userId !== userId);
    if (inGenericPosts) return inGenericPosts;

    const userPost = this.postService.userPostReadonly();
    if (userPost) return userPost;

    const inAllLoadedPosts = this.postService
      .allLoadedPosts()
      .find((p) => p.id === postId && p.userId === userId);
    if (inAllLoadedPosts) return inAllLoadedPosts;

    return null;
  });

  constructor() {
    // Aggiorna il titolo della pagina dinamicamente
    effect(() => {
      const p = this.post();
      this.titleService.setTitle(p ? p.title : 'Caricamento...');
    });
  }

  ngOnInit() {
    const currentUserId = this.userService.loadedCurrentUser()?.id;

    if (this.id() === currentUserId) {
      // Post dell'utente autenticato
      if (!this.postService.authUserPostsReadonly().length) {
        this.fetchCurrentUserPost();
      } else if (!this.post()) {
        // Lista ha post ma questo post non c'è
        this.router.navigateByUrl('/404', { skipLocationChange: true });
      }
    } else {
      // Post di un altro utente
      if (!this.postService.genericUserPostsReadonly().length) {
        this.fetchGenericUserPost(this.id());
      } else if (!this.post()) {
        // Lista ha post ma questo post non c'è
        this.router.navigateByUrl('/404', { skipLocationChange: true });
      }
    }
  }

  private fetchCurrentUserPost() {
    this.isFetching.set(true);
    this.postService
      .fetchPost(this.postId(), true)
      .pipe(
        finalize(() => this.isFetching.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (post) => {
          if (!post) {
            this.router.navigateByUrl('/404', { skipLocationChange: true });
          }
        },
        error: (error: unknown) => {
          this.error.set(error instanceof Error ? error.message : 'Errore sconosciuto');
        },
      });
  }

  private fetchGenericUserPost(userId: string) {
    this.isFetching.set(true);
    this.postService
      .fetchPostsByUser(userId, false)
      .pipe(
        finalize(() => this.isFetching.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (posts) => {
          const postExists = posts.some((p) => p.id === this.postId());
          if (!postExists) {
            this.router.navigateByUrl('/404', { skipLocationChange: true });
          }
        },
        error: (error: unknown) => {
          this.error.set(error instanceof Error ? error.message : 'Errore sconosciuto');
        },
      });
  }

  readonly isCurrentUserPost = computed(
    () => this.id() === this.authService.authenticatedUser()?.localId,
  );

  readonly HeartIcon = HeartIcon;
  readonly MessageCircleIcon = MessageCircleIcon;
  readonly RefreshCcw = RefreshCcw;
  readonly EllipsisIcon = EllipsisIcon;
}
