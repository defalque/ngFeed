import {
  ChangeDetectionStrategy,
  Component,
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
import { RouterLink } from '@angular/router';
import { UserService } from '@/core/services/user.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { FullPostSkeleton } from '@/shared/components/skeletons/full-post-skeleton/full-post-skeleton';

@Component({
  selector: 'app-full-post',
  imports: [BlogPost, LucideAngularModule, VerifiedIcon, FullPostSkeleton, RouterLink],
  templateUrl: './full-post.html',
  styleUrl: './full-post.css',
  host: { class: 'block w-full' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FullPost {
  private titleService = inject(Title);
  private postService = inject(PostService);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private destroyRef = inject(DestroyRef);

  id = input.required<string>();
  postId = input.required<string>();

  isFetching = signal(false);
  error = signal('');
  savedPostsIds = this.postService.loadedSavedPostsIds;
  likedPostsIds = computed(() => this.postService.loadedLikedPostsIds());
  readonly savedSet = computed(() => new Set(this.savedPostsIds()));
  readonly likedSet = computed(() => new Set(this.likedPostsIds()));

  // Segnale derivato per il post corrente
  post = computed(() => {
    const currentUserId = this.authService.authenticatedUser()?.localId;
    const postId = this.postId();

    // Cerca nei post dell'utente autenticato
    const inAuthPosts = this.postService
      .authUserPostsReadonly()
      .find((p) => p.id === postId && p.userId === currentUserId);

    // Cerca nei post di altri utenti
    const inGenericPosts = this.postService
      .genericUserPostsReadonly()
      .find((p) => p.id === postId && p.userId !== this.id());

    // Cerca nei post globali caricati
    const inAllLoadedPosts = this.postService
      .allLoadedPosts()
      .find((p) => p.id === postId && p.userId === this.id());

    if (currentUserId === this.id()) {
      // Se il post appartiene all'utente autenticato
      return inAuthPosts ?? this.postService.userPostReadonly() ?? inAllLoadedPosts ?? null;
    } else {
      // Post di altri utenti
      return inGenericPosts ?? this.postService.userPostReadonly() ?? inAllLoadedPosts ?? null;
    }
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
      }
    } else {
      // Post di un altro utente
      if (!this.postService.genericUserPostsReadonly().length) {
        this.fetchGenericUserPost(this.id());
      }
    }
  }

  private fetchCurrentUserPost() {
    this.isFetching.set(true);
    this.postService
      .fetchPost(this.postId(), true)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isFetching.set(false)),
      )
      .subscribe({
        error: (err: Error) => this.error.set(err.message),
      });
  }

  private fetchGenericUserPost(userId: string) {
    this.isFetching.set(true);
    this.postService
      .fetchPostsByUser(userId, false)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isFetching.set(false)),
      )
      .subscribe({
        error: (err: Error) => this.error.set(err.message),
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
