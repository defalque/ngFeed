import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  OnInit,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { EllipsisIcon, HeartIcon, LucideAngularModule, MessageCircleIcon } from 'lucide-angular';
import {
  ActivatedRoute,
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

@Component({
  selector: 'app-user',
  imports: [
    LucideAngularModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    UserSkeleton,
    VerifiedIcon,
  ],
  templateUrl: './user.html',
  styleUrl: './user.css',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'block w-full' },
})
export class User implements OnInit {
  private titleService = inject(Title);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private userService = inject(UserService);
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

  isFetching = signal(false);

  openDialog = this.modal.openDialog;

  constructor() {
    effect(() => {
      const id = this.id();
      const authUser = this.authenticatedUser();

      // console.log(id, authUser?.localId);

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

      const title = `${user.firstName + ' ' + user.lastName} – ngFeed`;

      this.titleService.setTitle(title);
    });
  }

  ngOnInit(): void {}

  loadAuthUserInfo() {
    this.isFetching.set(true);
    this.userService
      .fetchAuthUserInfo()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isFetching.set(false)),
      )
      .subscribe({
        error: (error: Error) => {
          console.log(error);
        },
      });
  }

  loadUserInfo(userId: string) {
    this.isFetching.set(true);
    this.userService
      .fetchUserInfo(userId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isFetching.set(false)),
      )
      .subscribe({
        error: (error: Error) => {
          console.log(error);
        },
      });
  }

  isCurrentUserPage() {
    return this.id() === this.authenticatedUser()?.localId;
  }

  isFollowing = signal(false);
  userIsFollowing = computed(() => {
    return this.followedIds().includes(this.id());
  });
  onFollowClick() {
    if (this.isFollowing()) return;

    if (this.isAuthenticated()) {
      if (!this.user()) {
        this.openDialog('edit-user', null);
        return;
      }

      this.isFollowing.set(true);
      if (this.userIsFollowing()) {
        this.userService
          .followAction(this.id(), 'unfollow')
          .pipe(
            takeUntilDestroyed(this.destroyRef),
            finalize(() => this.isFollowing.set(false)),
          )
          .subscribe({
            error: (error: Error) => {
              console.log(error);
            },
          });
        return;
      } else {
        this.userService
          .followAction(this.id(), 'follow')
          .pipe(
            takeUntilDestroyed(this.destroyRef),
            finalize(() => this.isFollowing.set(false)),
          )
          .subscribe({
            error: (error: Error) => {
              console.log(error);
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
