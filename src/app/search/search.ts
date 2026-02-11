import { UserService } from '@/user.service';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import {
  EllipsisIcon,
  LucideAngularModule,
  SearchIcon,
  SlidersHorizontalIcon,
} from 'lucide-angular';
import { RouterLink } from '@angular/router';
import { SearchUsersSkeleton } from '@/ui/skeletons/search-users-skeleton/search-users-skeleton';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-search',
  imports: [LucideAngularModule, RouterLink, SearchUsersSkeleton],
  templateUrl: './search.html',
  styleUrl: './search.css',
  host: { class: 'block w-full' },
})
export class Search implements OnInit {
  readonly EllipsisIcon = EllipsisIcon;
  readonly SearchIcon = SearchIcon;
  readonly SlidersHorizontalIcon = SlidersHorizontalIcon;

  private userService = inject(UserService);
  users = this.userService.loadedAllUsers;

  error = signal('');
  isFetching = signal(false);

  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.isFetching.set(true);
    this.userService
      .fetchAllUsers()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        // finalize viene eseguito SEMPRE, sia in caso di successo che errore
        finalize(() => this.isFetching.set(false)),
      )
      .subscribe({
        error: (error: Error) => {
          console.log(error);
          this.error.set(error.message);
        },
      });
  }
}
