import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { UserPostsSkeleton } from '@/shared/components/skeletons/user-posts-skeleton/user-posts-skeleton';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { PostService } from '@/core/services/post.service';
import { UserService } from '@/core/services/user.service';
import { BlogPost } from '@/features/posts/post/post';
import { AuthService } from '@/core/services/auth.service';

@Component({
  selector: 'app-user-posts',
  imports: [BlogPost, UserPostsSkeleton],
  templateUrl: './user-posts.html',
  styleUrl: './user-posts.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserPosts {
  private route = inject(ActivatedRoute);
  private postService = inject(PostService);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private destroyRef = inject(DestroyRef);

  id = input.required<string>();

  error = signal('');
  isFetching = signal(false);

  authenticatedUser = this.authService.authenticatedUser;
  loadedGenericUserPosts = this.postService.genericUserPostsReadonly;
  loadedCurrentUserPosts = this.postService.authUserPostsReadonly;
  savedPostsIds = this.postService.loadedSavedPostsIds;
  likedPostsIds = computed(() => this.postService.loadedLikedPostsIds());
  readonly savedSet = computed(() => new Set(this.savedPostsIds()));
  readonly likedSet = computed(() => new Set(this.likedPostsIds()));

  loadedUserPosts = computed(() => {
    return this.isCurrentUserPosts()
      ? this.loadedCurrentUserPosts()
      : this.loadedGenericUserPosts();
  });

  userExists = computed(() => {
    if (this.isCurrentUserPosts()) return true;
    if (this.userService.genericUserLoadingReadonly()) return true;
    const genericUser = this.userService.loadedGenericUser();
    return genericUser !== null && genericUser.id === this.id();
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const userId = params.get('id');
      const currentUserId = this.userService.loadedCurrentUser()?.id;

      if (userId === currentUserId) {
        // Solo se i post dell'utente autenticato non sono già caricati
        if (!this.loadedCurrentUserPosts().length) {
          this.fetchCurrentUserPosts();
        }
      } else if (userId) {
        // Se è un altro utente, fetch dei suoi post
        this.fetchGenericUserPosts(userId);
      }
    });
  }

  private fetchCurrentUserPosts() {
    this.isFetching.set(true);
    this.postService
      .fetchPostsByUser(this.authenticatedUser()!.localId, true)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isFetching.set(false)),
      )
      .subscribe({
        error: (err: Error) => this.error.set(err.message),
      });
  }

  private fetchGenericUserPosts(userId: string) {
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

  isCurrentUserPosts() {
    return this.id() === this.authService.authenticatedUser()?.localId;
  }
}
