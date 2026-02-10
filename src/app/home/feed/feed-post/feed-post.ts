import { Component, input, output, signal } from '@angular/core';
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
import { Post } from '@/models/post.model';
import { RouterLink } from '@angular/router';
import { PostActions } from '@/shared/post-actions/post-actions';

@Component({
  selector: 'app-feed-post',
  imports: [LucideAngularModule, ClickOutside, RouterLink, PostActions],
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

  type = input.required<'feed' | 'your-feed' | 'full-feed'>();
  post = input.required<Post>();
  currentUserFeeds = input.required<boolean>();

  optionsOpen = input.required<boolean>();
  openOptions = output<void>();
  closeOptions = output<void>();

  isOptionsOpen() {
    return this.optionsOpen();
  }

  onCloseOptions() {
    this.closeOptions.emit();
  }

  private onOptionsClick(event: MouseEvent) {
    event.stopPropagation();
    event.preventDefault();
    const el = event.target as HTMLElement;
    el.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }

  toggleOptionsOpen(event: MouseEvent) {
    this.onOptionsClick(event);

    if (this.optionsOpen()) {
      this.closeOptions.emit();
    } else {
      this.openOptions.emit();
    }
  }
}
