import { Component } from '@angular/core';

@Component({
  selector: 'li[searchUsersSkeleton]',
  imports: [],
  templateUrl: './search-users-skeleton.html',
  styleUrl: './search-users-skeleton.css',
  host: {
    class:
      'grid grid-cols-[2.8rem_1fr_auto] gap-x-2 px-2 md:px-4 py-4 border-b last:border-b-0 border-gray-200 animate-pulse',
  },
})
export class SearchUsersSkeleton {}
