import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'li[feedSkeleton]',
  imports: [],
  templateUrl: './feed-skeleton.html',
  styleUrl: './feed-skeleton.css',
  host: {
    class:
      'bg-white px-0 py-4 sm:p-4 w-full grid grid-cols-[2.8rem_1fr_auto] overflow-visible animate-pulse',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeedSkeleton {}
