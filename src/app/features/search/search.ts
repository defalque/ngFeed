import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import {
  EllipsisIcon,
  LucideAngularModule,
  SearchIcon,
  SlidersHorizontalIcon,
} from 'lucide-angular';
import { Router, RouterLink } from '@angular/router';
import { SearchUsersSkeleton } from '@/shared/components/skeletons/search-users-skeleton/search-users-skeleton';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { UserService } from '@/core/services/user.service';
import { AuthService } from '@/core/services/auth.service';
import { ModalService } from '@/core/services/modal.service';
import { A11yModule } from '@angular/cdk/a11y';

@Component({
  selector: 'app-search',
  imports: [LucideAngularModule, RouterLink, SearchUsersSkeleton, A11yModule],
  templateUrl: './search.html',
  styleUrl: './search.css',
  host: { class: 'block w-full' },
})
export class Search implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private modalService = inject(ModalService);
  private destroyRef = inject(DestroyRef);

  isAuthenticated = this.authService.isAuthenticated;
  users = this.userService.loadedAllUsers;
  currentUser = this.userService.loadedCurrentUser;
  openDialog = this.modalService.openDialog;

  error = signal('');
  isFetching = signal(false);

  ngOnInit(): void {
    this.isFetching.set(true);
    this.userService
      .fetchAllUsers()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.isFetching.set(false)),
      )
      .subscribe({
        error: (error: Error) => {
          console.log(error);
          this.error.set(error.message);
        },
      });
  }

  onFollowClick() {
    if (this.isAuthenticated()) {
      if (!this.currentUser()) {
        this.openDialog('edit-user', null);
        return;
      }

      // logica follow-user
      return;
    }

    this.router.navigate(['/auth']);
  }

  readonly EllipsisIcon = EllipsisIcon;
  readonly SearchIcon = SearchIcon;
  readonly SlidersHorizontalIcon = SlidersHorizontalIcon;
}
