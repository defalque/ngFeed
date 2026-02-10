import { Component } from '@angular/core';

@Component({
  selector: 'div[fullFeedSkeleton]',
  imports: [],
  templateUrl: './full-feed-skeleton.html',
  styleUrl: './full-feed-skeleton.css',
  host: {
    class:
      'bg-white p-4 w-full grid grid-cols-[2.8rem_1fr_auto] gap-y-2 overflow-visible animate-pulse',
  },
})
export class FullFeedSkeleton {}
