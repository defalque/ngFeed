import { PostService } from '@/core/services/post.service';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, input } from '@angular/core';
import { HeartIcon, LucideAngularModule, MessageCircleIcon, RefreshCcw } from 'lucide-angular';
import { AuthService } from '@/core/services/auth.service';
import { UserService } from '@/core/services/user.service';
import { ModalService } from '@/core/services/modal.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { ToasterService } from 'better-toast';

@Component({
  selector: 'app-post-actions',
  imports: [LucideAngularModule],
  templateUrl: './post-actions.html',
  styleUrl: './post-actions.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'flex items-center gap-2 col-start-2 col-span-1 -ml-2',
  },
})
export class PostActions {
  private router = inject(Router);
  private postService = inject(PostService);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private modalService = inject(ModalService);
  private toaster = inject(ToasterService);
  private destroyRef = inject(DestroyRef);

  isAuthenticated = this.authService.isAuthenticated;
  currentUser = this.userService.loadedCurrentUser;
  openDialog = this.modalService.openDialog;

  isLikedPost = input.required<boolean>();
  postId = input.required<string>();
  likesCount = input.required<number>();
  commentsCount = input.required<number>();

  onLikePostClick(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();

    if (this.isAuthenticated()) {
      if (!this.currentUser()) {
        this.openDialog('edit-user', null);
        return;
      }

      if (this.isLikedPost()) {
        this.postService
          .likePostAction(this.postId(), 'unlike')
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            error: (error: Error) => {
              this.toaster.error(error.message);
            },
          });
        return;
      } else {
        this.postService
          .likePostAction(this.postId(), 'like')
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe({
            error: (error: Error) => {
              this.toaster.error(error.message);
            },
          });
        return;
      }
    }

    this.router.navigate(['/auth']);
  }

  readonly HeartIcon = HeartIcon;
  readonly MessageCircleIcon = MessageCircleIcon;
  readonly RefreshCcw = RefreshCcw;
}
