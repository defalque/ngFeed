import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'div[fullPostSkeleton]',
  imports: [],
  templateUrl: './full-post-skeleton.html',
  styleUrl: './full-post-skeleton.css',
  host: {
    class:
      'bg-white dark:bg-zinc-950 md:bg-gray-50/40 md:dark:bg-zinc-900/60 px-1 py-3 sm:px-4 sm:py-3 w-full grid grid-cols-[2.8rem_1fr_auto] gap-y-2 overflow-visible ',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FullPostSkeleton {}
