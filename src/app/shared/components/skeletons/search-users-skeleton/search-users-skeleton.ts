import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'li[searchUsersSkeleton]',
  imports: [],
  templateUrl: './search-users-skeleton.html',
  styleUrl: './search-users-skeleton.css',
  host: {
    class: 'grid grid-cols-[2.8rem_1fr_auto] gap-x-2 px-2 md:px-4 py-4  animate-pulse',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SearchUsersSkeleton {}
