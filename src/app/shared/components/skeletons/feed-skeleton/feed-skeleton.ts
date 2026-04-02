import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'li[feedSkeleton]',
  imports: [],
  templateUrl: './feed-skeleton.html',
  styleUrl: './feed-skeleton.css',
  host: {
    class:
      'bg-white px-1 py-3 sm:px-5 sm:py-3 w-full grid grid-cols-[2.8rem_1fr_auto] overflow-visible animate-pulse',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeedSkeleton {}
