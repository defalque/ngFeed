import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'div[fullPostSkeleton]',
  imports: [],
  templateUrl: './full-post-skeleton.html',
  styleUrl: './full-post-skeleton.css',
  host: {
    class:
      'bg-white p-4 w-full grid grid-cols-[2.8rem_1fr_auto] gap-y-2 overflow-visible animate-pulse',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FullPostSkeleton {}
