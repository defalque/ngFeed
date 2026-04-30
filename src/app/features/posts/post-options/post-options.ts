import { ClickOutsideDirective } from '@/shared/directives/click-outside.directive';
import { DropdownMenu } from '@/shared/components/dropdown-menu/dropdown-menu';
import { ModalService } from '@/core/services/modal.service';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import {
  BookmarkIcon,
  EllipsisIcon,
  LucideAngularModule,
  MessageSquareWarningIcon,
  PencilIcon,
  ThumbsDownIcon,
  TrashIcon,
} from 'lucide-angular';
import { UserService } from '@/core/services/user.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, firstValueFrom } from 'rxjs';
import { AuthService } from '@/core/services/auth.service';
import { Router } from '@angular/router';
import { PostService } from '@/core/services/post.service';
import { ToasterService } from 'better-toast';

@Component({
  selector: 'app-post-options',
  imports: [ClickOutsideDirective, LucideAngularModule, DropdownMenu],
  templateUrl: './post-options.html',
  styleUrl: './post-options.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostOptions {
  private modal = inject(ModalService);
  private router = inject(Router);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private postService = inject(PostService);
  private toaster = inject(ToasterService);
  private destroyRef = inject(DestroyRef);

  isAuthenticated = this.authService.isAuthenticated;
  currentUser = this.userService.loadedCurrentUser;

  id = input.required<string>();
  isCurrentUserPost = input.required<boolean>();

  isSavedPost = input.required<boolean>();
  isOptionsOpen = input.required<boolean>();
  openOptions = output<void>();
  closeOptions = output<void>();

  openDialog = this.modal.openDialog;

  private onOptionsClick(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    const el = event.target as HTMLElement;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
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
    this.openDialog('delete', this.id());
  }

  isSavingPost = signal(false);
  onSavePostClick(event: MouseEvent) {
    if (this.isSavingPost()) return;

    event.preventDefault();
    event.stopPropagation();

    if (this.isAuthenticated()) {
      if (!this.currentUser()) {
        this.toggleOptionsOpen();
        this.openDialog('edit-user', null);
        return;
      }

      if (this.isSavedPost()) {
        this.isSavingPost.set(true);

        this.toaster.promise(
          firstValueFrom(
            this.postService.savePostAction(this.id(), 'unsave').pipe(
              takeUntilDestroyed(this.destroyRef),
              finalize(() => {
                this.isSavingPost.set(false);
                this.toggleOptionsOpen();
              }),
            ),
          ),
          {
            loading: 'Rimozione dai preferiti…',
            success: 'Post rimosso dai preferiti',
            error: (reason: unknown) =>
              reason instanceof Error
                ? reason.message
                : 'Errore durante la rimozione del post dai preferiti',
          },
        );
        return;
      } else {
        this.isSavingPost.set(true);

        this.toaster.promise(
          firstValueFrom(
            this.postService.savePostAction(this.id(), 'save').pipe(
              takeUntilDestroyed(this.destroyRef),
              finalize(() => {
                this.isSavingPost.set(false);
                this.toggleOptionsOpen();
              }),
            ),
          ),
          {
            loading: 'Salvataggio post…',
            success: 'Post aggiunto ai preferiti',
            error: (reason: unknown) =>
              reason instanceof Error
                ? reason.message
                : "Errore durante l'aggiunta del post ai preferiti",
          },
        );

        return;
      }
    }

    this.router.navigate(['/auth']);
  }

  readonly EllipsisIcon = EllipsisIcon;
  readonly BookmarkIcon = BookmarkIcon;
  readonly ThumbsDownIcon = ThumbsDownIcon;
  readonly MessageSquareWarningIcon = MessageSquareWarningIcon;
  readonly TrashIcon = TrashIcon;
  readonly PencilIcon = PencilIcon;
}
