import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'li[userPostsSkeleton]',
  imports: [],
  templateUrl: './user-posts-skeleton.html',
  styleUrl: './user-posts-skeleton.css',
  host: {
    class: 'flex flex-col gap-2 items-start px-2.5 sm:px-4 py-3 w-full animate-pulse',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserPostsSkeleton {}
