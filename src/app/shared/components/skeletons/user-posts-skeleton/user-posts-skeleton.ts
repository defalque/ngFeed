import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'li[userPostsSkeleton]',
  imports: [],
  templateUrl: './user-posts-skeleton.html',
  styleUrl: './user-posts-skeleton.css',
  host: {
    class: 'px-1 py-3 sm:px-5 sm:py-3 w-full grid grid-cols-[2.8rem_1fr_auto] animate-pulse',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserPostsSkeleton {}
