import { Component, input, signal } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import {
  EllipsisIcon,
  HeartIcon,
  MessageCircleIcon,
  RefreshCcw,
  BookmarkIcon,
  ThumbsDownIcon,
  MessageSquareWarningIcon,
  TrashIcon,
  PencilIcon,
} from 'lucide-angular';
import { ClickOutside } from '@/click-outside.directive';

@Component({
  selector: 'app-feed-post',
  imports: [LucideAngularModule, ClickOutside],
  templateUrl: './feed-post.html',
  styleUrl: './feed-post.css',
})
export class FeedPost {
  readonly HeartIcon = HeartIcon;
  readonly MessageCircleIcon = MessageCircleIcon;
  readonly RefreshCcw = RefreshCcw;
  readonly EllipsisIcon = EllipsisIcon;
  readonly BookmarkIcon = BookmarkIcon;
  readonly ThumbsDownIcon = ThumbsDownIcon;
  readonly MessageSquareWarningIcon = MessageSquareWarningIcon;
  readonly TrashIcon = TrashIcon;
  readonly PencilIcon = PencilIcon;

  type = input.required<'feed' | 'your-feeds'>();
  isOptionsOpen = signal(false);

  closeOptions() {
    this.isOptionsOpen.set(false);
  }

  onOptionsClick(event: MouseEvent) {
    const el = event.target as HTMLElement;
    el.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }

  toggleOptionsOpen(event: MouseEvent) {
    this.isOptionsOpen.set(!this.isOptionsOpen());
    if (this.isOptionsOpen()) {
      this.onOptionsClick(event);
    }
  }
}
