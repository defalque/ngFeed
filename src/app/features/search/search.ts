import { Component, computed, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import {
  EllipsisIcon,
  LucideAngularModule,
  SearchIcon,
  SlidersHorizontalIcon,
} from 'lucide-angular';
import { Router, RouterLink } from '@angular/router';
import { SearchUsersSkeleton } from '@/shared/components/skeletons/search-users-skeleton/search-users-skeleton';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs';
import { UserService } from '@/core/services/user.service';
import { AuthService } from '@/core/services/auth.service';
import { ModalService } from '@/core/services/modal.service';
import { A11yModule } from '@angular/cdk/a11y';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ClickOutside } from '@/shared/directives/click-outside.directive';
import { DropdownMenu } from '@/shared/components/dropdown-menu/dropdown-menu';
import { VerifiedIcon } from '@/shared/components/verified-icon/verified-icon';

@Component({
  selector: 'app-search',
  imports: [
    LucideAngularModule,
    RouterLink,
    SearchUsersSkeleton,
    A11yModule,
    ReactiveFormsModule,
    ClickOutside,
    DropdownMenu,
    VerifiedIcon,
  ],
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

  // query params con input binding automatico
  verified = input<'true'>();
  orderBy = input<'most-followed'>();

  isAuthenticated = this.authService.isAuthenticated;
  users = this.userService.loadedAllUsers;
  currentUser = this.userService.loadedCurrentUser;
  openDialog = this.modalService.openDialog;

  error = signal('');
  isFetching = signal(false);
  isOpen = signal(false);

  closeMenu() {
    this.isOpen.set(false);
  }

  toggleOpen() {
    this.isOpen.set(!this.isOpen());
  }

  searchControl = new FormControl('', { nonNullable: true });
  private search$ = this.searchControl.valueChanges.pipe(debounceTime(300), distinctUntilChanged());
  search = toSignal(this.search$, { initialValue: '' });

  filteredUsers = computed(() => {
    let result = this.users();

    const term = this.search().toLowerCase();
    if (term) {
      result = result.filter((user) => user.username.toLowerCase().includes(term));
    }

    const verified = this.verified();
    if (verified === 'true') {
      result = result.filter((user) => user.isVerified);
    }

    if (this.orderBy() === 'most-followed') {
      result = [...result].sort((a, b) => b.followersCount - a.followersCount);
    }

    return result;
  });

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
