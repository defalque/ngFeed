import { Component, computed, DestroyRef, inject, input, OnInit, signal } from '@angular/core';
import { LucideAngularModule, SearchIcon, SlidersHorizontalIcon } from 'lucide-angular';
import { RouterLink } from '@angular/router';
import { SearchUsersSkeleton } from '@/shared/components/skeletons/search-users-skeleton/search-users-skeleton';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { debounceTime, distinctUntilChanged, finalize, of, switchMap, tap } from 'rxjs';
import { UserService } from '@/core/services/user.service';
import { A11yModule } from '@angular/cdk/a11y';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ClickOutside } from '@/shared/directives/click-outside.directive';
import { DropdownMenu } from '@/shared/components/dropdown-menu/dropdown-menu';
import { VerifiedIcon } from '@/shared/components/verified-icon/verified-icon';
import { UserCard } from '../user/user-card/user-card';

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
    UserCard,
  ],
  templateUrl: './search.html',
  styleUrl: './search.css',
  host: { class: 'block w-full' },
})
export class Search implements OnInit {
  private userService = inject(UserService);
  private destroyRef = inject(DestroyRef);

  followedIds = this.userService.loadedFollowedIds;

  // query params con input binding automatico
  verified = input<'true'>();
  orderBy = input<'most-followed'>();

  // gestione fetching iniziale
  allUsers = computed(() =>
    this.userService.loadedAllUsers().filter((u) => !this.followedIds().includes(u.id)),
  );
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

  // gestione dropdown filtri
  isOpen = signal(false);
  closeMenu() {
    this.isOpen.set(false);
  }
  toggleOpen() {
    this.isOpen.set(!this.isOpen());
  }

  // gestione search input
  isSearching = signal(false);
  isFollowActionPending = signal(false);
  onFollowActionPendingChange(isPending: boolean) {
    this.isFollowActionPending.set(isPending);
  }
  searchControl = new FormControl('', { nonNullable: true });
  usersToSearch$ = this.searchControl.valueChanges.pipe(
    tap((term) => this.isSearching.set(term.trim().length > 0)), // mostra subito loading quando l'input non e vuoto
    debounceTime(300), // aspetta 300ms prima di fare la query
    distinctUntilChanged(), // evita richieste duplicate
    switchMap((term) => {
      const normalizedTerm = term.trim();
      if (!normalizedTerm.length) {
        this.isSearching.set(false);
        return of([]);
      }

      // riafferma loading dopo eventuale cancellazione della richiesta precedente
      this.isSearching.set(true);
      return this.userService.searchUser(normalizedTerm).pipe(
        finalize(() => this.isSearching.set(false)), // al termine della query, disattiva loading
      );
    }),
  );
  usersToSearch = toSignal(this.usersToSearch$, { initialValue: [] });
  filteredUsers = computed(() => {
    let result = this.usersToSearch();

    if (this.verified() === 'true') {
      result = result.filter((u) => u.isVerified);
    }

    if (this.orderBy() === 'most-followed') {
      result = [...result].sort((a, b) => b.followersCount - a.followersCount);
    }

    return result;
  });

  readonly SearchIcon = SearchIcon;
  readonly SlidersHorizontalIcon = SlidersHorizontalIcon;
}
