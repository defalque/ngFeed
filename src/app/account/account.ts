import { Component, DestroyRef, effect, inject, signal, ViewEncapsulation } from '@angular/core';
import { EllipsisIcon, HeartIcon, LucideAngularModule, MessageCircleIcon } from 'lucide-angular';
import {
  ActivatedRoute,
  ResolveFn,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { UserService } from '@/user.service';
import { AccountSkeleton } from '@/ui/skeletons/account-skeleton/account-skeleton';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-account',
  imports: [LucideAngularModule, RouterOutlet, RouterLink, RouterLinkActive, AccountSkeleton],
  templateUrl: './account.html',
  styleUrl: './account.css',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'block w-full' },
})
// export class Account implements OnInit {
export class Account {
  private titleService = inject(Title);
  readonly EllipsisIcon = EllipsisIcon;
  readonly HeartIcon = HeartIcon;
  readonly MessageCircleIcon = MessageCircleIcon;

  private router = inject(Router);

  userId = signal('');
  private route = inject(ActivatedRoute);

  private userService = inject(UserService);
  private currentUser = this.userService.loadedCurrentUser;
  user = this.userService.user;
  isFetching = signal(false);

  private destroyRef = inject(DestroyRef);

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

  isUpdateProfileUrlActive() {
    return this.router.url === '/' + this.currentUser()?.username + '/modifica';
  }
}
