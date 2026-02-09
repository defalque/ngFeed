import { UserService } from '@/user.service';
import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import {
  EllipsisIcon,
  LucideAngularModule,
  SearchIcon,
  SlidersHorizontalIcon,
} from 'lucide-angular';

@Component({
  selector: 'app-search',
  imports: [LucideAngularModule],
  templateUrl: './search.html',
  styleUrl: './search.css',
  host: { class: 'block w-full' },
})
export class Search implements OnInit {
  readonly EllipsisIcon = EllipsisIcon;
  readonly SearchIcon = SearchIcon;
  readonly SlidersHorizontalIcon = SlidersHorizontalIcon;

  private userService = inject(UserService);
  users = this.userService.loadedUsers;

  error = signal('');
  isFetching = signal(false);

  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.isFetching.set(true);
    const sub = this.userService.fetchAllUsers().subscribe({
      error: (error: Error) => {
        console.log(error);
        this.error.set(error.message);
      },
      complete: () => {
        this.isFetching.set(false);
      },
    });

    this.destroyRef.onDestroy(() => {
      sub.unsubscribe();
    });
  }
}
