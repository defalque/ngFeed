import {
  Component,
  DestroyRef,
  effect,
  inject,
  OnInit,
  signal,
  ViewEncapsulation,
} from '@angular/core';
import { EllipsisIcon, HeartIcon, LucideAngularModule, MessageCircleIcon } from 'lucide-angular';
import { ActivatedRoute, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { UserSkeleton } from '@/shared/components/skeletons/user-skeleton/user-skeleton';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { ModalService } from '@/core/services/modal.service';
import { VerifiedIcon } from '@/shared/components/verified-icon/verified-icon';
import { UserService } from '@/core/services/user.service';

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
  private userService = inject(UserService);
  private modal = inject(ModalService);
  private destroyRef = inject(DestroyRef);

  userId = signal('');

  private currentUser = this.userService.loadedCurrentUser;
  user = this.userService.user;
  isFetching = signal(false);

  openDialog = this.modal.openDialog;

  constructor() {
    effect(() => {
      const userData = this.user();
      if (userData) {
        const fullTitle = `ngFeed - ${userData.firstName} ${userData.lastName || ''}`.trim();
        this.titleService.setTitle(fullTitle);
      } else {
        this.titleService.setTitle('Caricamento...');
      }
    });
  }

  ngOnInit(): void {
    const sub = this.route.params.subscribe((params) => {
      this.userId.set(params['id']);
      if (this.currentUser()?.id === this.userId()) {
        this.user.set(this.currentUser());
        return;
      }
      this.loadUser(this.userId());
    });
    this.destroyRef.onDestroy(() => {
      sub.unsubscribe();
    });
  }

  loadUser(userId: string) {
    this.isFetching.set(true);
    this.userService
      .fetchUser(userId)
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
    return this.userId() === this.currentUser()?.id;
  }

  readonly EllipsisIcon = EllipsisIcon;
  readonly HeartIcon = HeartIcon;
  readonly MessageCircleIcon = MessageCircleIcon;
}
