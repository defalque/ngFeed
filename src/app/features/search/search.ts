import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { LucideAngularModule, SearchIcon, SlidersHorizontalIcon } from 'lucide-angular';
import { RouterLink } from '@angular/router';
import { SearchUsersSkeleton } from '@/shared/components/skeletons/search-users-skeleton/search-users-skeleton';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import type { Observable } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, finalize, of, switchMap, tap } from 'rxjs';
import { UserService } from '@/core/services/user.service';
import type { User } from '@/core/types/user.model';
import { A11yModule } from '@angular/cdk/a11y';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ClickOutsideDirective } from '@/shared/directives/click-outside.directive';
import { DropdownMenu } from '@/shared/components/dropdown-menu/dropdown-menu';
import { VerifiedIcon } from '@/shared/components/verified-icon/verified-icon';
import { UserCard } from '../user/user-card/user-card';
import { AuthService } from '@/core/services/auth.service';
import { EmptyWrapper } from '@/shared/components/empty-wrapper/empty-wrapper';

@Component({
  selector: 'app-search',
  imports: [
    LucideAngularModule,
    RouterLink,
    SearchUsersSkeleton,
    A11yModule,
    ReactiveFormsModule,
    ClickOutsideDirective,
    DropdownMenu,
    VerifiedIcon,
    UserCard,
    EmptyWrapper,
  ],
  templateUrl: './search.html',
  styleUrl: './search.css',
  host: { class: 'block w-full min-h-screen' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Search implements OnInit {
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef);

  currentUser = this.userService.loadedCurrentUser;
  isAuthenticated = this.authService.isAuthenticated;
  followedIds = computed(() => this.userService.loadedFollowedIds());

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
        finalize(() => this.isFetching.set(false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        error: (error: Error) => {
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

  // gestione ricerca
  isSearching = signal(false);
  isFollowActionPending = signal(false);
  onFollowActionPendingChange(isPending: boolean) {
    this.isFollowActionPending.set(isPending);
  }
  searchControl = new FormControl('', { nonNullable: true });

  private fetchSearchResults(query: string): Observable<User[]> {
    if (this.error()) {
      return of([]);
    }
    this.isSearching.set(true);
    return this.userService.searchUser(query).pipe(
      finalize(() => this.isSearching.set(false)),
      catchError((err) => {
        this.error.set(err?.message ?? 'Ricerca non disponibile');
        return of([]);
      }),
    );
  }

  usersToSearch$ = this.searchControl.valueChanges.pipe(
    tap((term) => this.isSearching.set(term.trim().length > 0)),
    debounceTime(300),
    distinctUntilChanged(),
    switchMap((term) => {
      const q = term.trim();
      if (!q.length) {
        this.isSearching.set(false);
        return of<User[]>([]);
      }
      return this.fetchSearchResults(q);
    }),
  );
  usersToSearch = toSignal(this.usersToSearch$, { initialValue: [] as User[] });

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
