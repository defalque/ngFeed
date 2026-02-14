import { ClickOutside } from '@/click-outside.directive';
import { Component, inject, input, output, signal } from '@angular/core';
import {
  BookmarkIcon,
  EllipsisIcon,
  LucideAngularModule,
  MessageSquareWarningIcon,
  PencilIcon,
  ThumbsDownIcon,
  TrashIcon,
} from 'lucide-angular';
import { ModalService } from '../modal/modal.service';

@Component({
  selector: 'app-post-options',
  imports: [ClickOutside, LucideAngularModule],
  templateUrl: './post-options.html',
  styleUrl: './post-options.css',
})
export class PostOptions {
  private modal = inject(ModalService);

  id = input.required<string>();
  isCurrentUserPost = input.required<boolean>();

  isOptionsOpen = input.required<boolean>();
  openOptions = output<void>();
  closeOptions = output<void>();

  openDialog = this.modal.openDialog;

  private onOptionsClick(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    const el = event.target as HTMLElement;
    el.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }

  toggleOptionsOpen(event?: MouseEvent) {
    if (event) this.onOptionsClick(event);

    if (this.isOptionsOpen()) {
      this.closeOptions.emit();
    } else {
      this.openOptions.emit();
    }
  }

  openEditPostDialog(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.toggleOptionsOpen();
    this.openDialog('edit', this.id());
  }

  openDeletePostDialog(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.toggleOptionsOpen();
    console.log(this.id());
    this.openDialog('delete', this.id());
  }

  readonly EllipsisIcon = EllipsisIcon;
  readonly BookmarkIcon = BookmarkIcon;
  readonly ThumbsDownIcon = ThumbsDownIcon;
  readonly MessageSquareWarningIcon = MessageSquareWarningIcon;
  readonly TrashIcon = TrashIcon;
  readonly PencilIcon = PencilIcon;
}
