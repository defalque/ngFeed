import { Component, input } from '@angular/core';
import { HeartIcon, LucideAngularModule, MessageCircleIcon, RefreshCcw } from 'lucide-angular';

@Component({
  selector: 'app-post-actions',
  imports: [LucideAngularModule],
  templateUrl: './post-actions.html',
  styleUrl: './post-actions.css',
  host: {
    class: 'flex items-center gap-2 col-start-2 pt-2 col-span-1 -ml-2',
  },
})
export class PostActions {
  readonly HeartIcon = HeartIcon;
  readonly MessageCircleIcon = MessageCircleIcon;
  readonly RefreshCcw = RefreshCcw;

  likesCount = input.required<number>();
  commentsCount = input.required<number>();
}
