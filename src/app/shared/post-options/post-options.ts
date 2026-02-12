import { ClickOutside } from '@/click-outside.directive';
import { Component, input, output, signal } from '@angular/core';
import {
  BookmarkIcon,
  EllipsisIcon,
  LucideAngularModule,
  MessageSquareWarningIcon,
  PencilIcon,
  ThumbsDownIcon,
  TrashIcon,
} from 'lucide-angular';

@Component({
  selector: 'app-post-options',
  imports: [ClickOutside, LucideAngularModule],
  templateUrl: './post-options.html',
  styleUrl: './post-options.css',
})
export class PostOptions {
  isCurrentUserPost = input.required<boolean>();

  isOptionsOpen = input.required<boolean>();
  openOptions = output<void>();
  closeOptions = output<void>();

  private onOptionsClick(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    const el = event.target as HTMLElement;
    el.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }

  toggleOptionsOpen(event: MouseEvent) {
    this.onOptionsClick(event);

    if (this.isOptionsOpen()) {
      this.closeOptions.emit();
    } else {
      this.openOptions.emit();
    }
  }

  readonly EllipsisIcon = EllipsisIcon;
  readonly BookmarkIcon = BookmarkIcon;
  readonly ThumbsDownIcon = ThumbsDownIcon;
  readonly MessageSquareWarningIcon = MessageSquareWarningIcon;
  readonly TrashIcon = TrashIcon;
  readonly PencilIcon = PencilIcon;
}
