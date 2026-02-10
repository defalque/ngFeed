import { Component } from '@angular/core';

@Component({
  selector: 'li[userFeedSkeleton]',
  imports: [],
  templateUrl: './user-feed-skeleton.html',
  styleUrl: './user-feed-skeleton.css',
  host: {
    class: 'flex flex-col gap-2 items-start px-4 py-6 w-full animate-pulse',
  },
})
export class UserFeedSkeleton {}
