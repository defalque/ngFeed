import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { EllipsisIcon, HeartIcon, LucideAngularModule, MessageCircleIcon } from 'lucide-angular';
import { NgOptimizedImage } from '@angular/common';
import {
  // ActivatedRoute,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { UserSkeleton } from '@/shared/components/skeletons/user-skeleton/user-skeleton';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { ModalService } from '@/core/services/modal.service';
import { VerifiedIcon } from '@/shared/components/verified-icon/verified-icon';
import { UserService } from '@/core/services/user.service';
import { AuthService } from '@/core/services/auth.service';
import { ToasterService } from 'better-toast';
import { Button } from '@/shared/components/button/button';
import { EmptyWrapper } from '@/shared/components/empty-wrapper/empty-wrapper';
import { DEFAULT_AVATAR_PATH, safeAvatarUrl } from '@/core/utils/safe-avatar-url';

@Component({
  selector: 'app-user',
  imports: [
    LucideAngularModule,
    NgOptimizedImage,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    UserSkeleton,
    VerifiedIcon,
    Button,
    EmptyWrapper,
  ],
  templateUrl: './user.html',
  styleUrl: './user.css',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'block w-full' },
})
export class User {
  private titleService = inject(Title);
  // private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private toaster = inject(ToasterService);
  private modal = inject(ModalService);
  private destroyRef = inject(DestroyRef);
  private router = inject(Router);

  id = input.required<string>();
  userId = signal('');

  authenticatedUser = this.authService.authenticatedUser;
  isAuthenticated = this.authService.isAuthenticated;
  followedIds = this.userService.loadedFollowedIds;

  user = computed(() => {
    return this.isCurrentUserPage()
      ? this.userService.loadedCurrentUser()
      : this.userService.loadedGenericUser();
  });

  avatarError = signal(false);
  avatarSrc = computed(() => {
    if (this.avatarError()) return DEFAULT_AVATAR_PATH;
    return safeAvatarUrl(this.user()?.avatar);
  });

  isFetching = signal(false);
  error = signal('');

  openDialog = this.modal.openDialog;

  constructor() {
    effect(() => {
      const id = this.id();
      const authUser = this.authenticatedUser();

      if (!id) return;

      if (id === authUser?.localId) {
        if (this.user()) return;
        this.loadAuthUserInfo();
      } else {
        this.loadUserInfo(id);
      }
    });

    effect(() => {
      const user = this.user(); // reagisce sia se fetchato ora che già presente
      if (!user) return;

      this.avatarError.set(false);
      this.titleService.setTitle(`${user.firstName + ' ' + user.lastName} – ngFeed`);
    });
  }

  onAvatarError(): void {
    this.avatarError.set(true);
  }

  loadAuthUserInfo() {
    this.isFetching.set(true);
    this.userService
      .fetchAuthUserInfo()
      .pipe(
        finalize(() => this.isFetching.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        error: (error: unknown) => {
          if (error instanceof Error) {
            this.error.set(error.message);
          } else {
            this.error.set('Errore sconosciuto');
          }
        },
      });
  }

  loadUserInfo(userId: string) {
    this.isFetching.set(true);
    this.userService
      .fetchUserInfo(userId)
      .pipe(
        finalize(() => this.isFetching.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (user) => {
          if (!user) {
            this.router.navigateByUrl('/404', { skipLocationChange: true });
          }
        },
        error: (error: Error) => {
          if (error instanceof Error) {
            this.error.set(error.message);
          } else {
            this.error.set('Errore sconosciuto');
          }
        },
      });
  }

  isCurrentUserPage = computed(() => {
    return this.id() === this.authenticatedUser()?.localId;
  });

  isFollowing = signal(false);
  userIsFollowing = computed(() => {
    return this.followedIds().includes(this.id());
  });
  onFollowClick() {
    if (this.isFollowing()) return;

    if (this.isAuthenticated()) {
      if (!this.userService.loadedCurrentUser()) {
        this.openDialog('edit-user', null);
        return;
      }

      this.isFollowing.set(true);
      if (this.userIsFollowing()) {
        this.userService
          .followAction(this.id(), 'unfollow')
          .pipe(
            finalize(() => this.isFollowing.set(false)),
            takeUntilDestroyed(this.destroyRef),
          )
          .subscribe({
            error: (err: unknown) => {
              const msg =
                err instanceof Error ? err.message : 'Errore imprevisto. Riprova a breve.';
              this.toaster.error(msg);
            },
          });
        return;
      } else {
        this.userService
          .followAction(this.id(), 'follow')
          .pipe(
            finalize(() => this.isFollowing.set(false)),
            takeUntilDestroyed(this.destroyRef),
          )
          .subscribe({
            error: (err: unknown) => {
              const msg =
                err instanceof Error ? err.message : 'Errore imprevisto. Riprova a breve.';
              this.toaster.error(msg);
            },
          });
      }
      return;
    }

    this.router.navigate(['/auth']);
  }

  readonly EllipsisIcon = EllipsisIcon;
  readonly HeartIcon = HeartIcon;
  readonly MessageCircleIcon = MessageCircleIcon;
}
