import { Component } from '@angular/core';

@Component({
  selector: 'li[feedSkeleton]',
  imports: [],
  templateUrl: './feed-skeleton.html',
  styleUrl: './feed-skeleton.css',
  host: {
    class: 'bg-white p-4 w-full grid grid-cols-[2.8rem_1fr_auto] overflow-visible animate-pulse',
  },
})
export class FeedSkeleton {}
