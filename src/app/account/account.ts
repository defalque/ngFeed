import { Component, inject, OnInit, signal, ViewEncapsulation } from '@angular/core';
import { EllipsisIcon, HeartIcon, LucideAngularModule, MessageCircleIcon } from 'lucide-angular';
import {
  ActivatedRoute,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { UserService } from '@/user.service';
import { AccountSkeleton } from '@/ui/skeletons/account-skeleton/account-skeleton';

@Component({
  selector: 'app-account',
  imports: [LucideAngularModule, RouterOutlet, RouterLink, RouterLinkActive, AccountSkeleton],
  templateUrl: './account.html',
  styleUrl: './account.css',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'block w-full' },
})
export class Account implements OnInit {
  readonly EllipsisIcon = EllipsisIcon;
  readonly HeartIcon = HeartIcon;
  readonly MessageCircleIcon = MessageCircleIcon;

  userId!: string;

  private router = inject(Router);
  private route = inject(ActivatedRoute);

  private userService = inject(UserService);
  private currentUser = this.userService.loadedCurrentUser;
  user = this.userService.user;
  isFetching = signal(false);

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.userId = params.get('id')!;

      this.loadUser(this.userId);
    });
  }

  loadUser(userId: string) {
    if (this.currentUser()?.id === userId) {
      this.user.set(this.currentUser());
      return;
    }

    this.isFetching.set(true);
    this.userService.fetchUser(userId).subscribe({
      error: (error: Error) => {
        console.log(error);
        // this.error.set(error.message);
      },
      complete: () => {
        this.isFetching.set(false);
      },
    });
  }

  isCurrentUserPage() {
    return this.userId === this.currentUser()?.id;
  }

  isUpdateProfileUrlActive() {
    return this.router.url === '/' + this.currentUser()?.username + '/modifica';
  }
}
