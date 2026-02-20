import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'div[userSkeleton]',
  imports: [],
  templateUrl: './user-skeleton.html',
  styleUrl: './user-skeleton.css',
  host: {
    class: 'w-full',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserSkeleton {}
