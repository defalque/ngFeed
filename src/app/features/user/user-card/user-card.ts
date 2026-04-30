import { ModalService } from '@/core/services/modal.service';
import { UserService } from '@/core/services/user.service';
import { User } from '@/core/types/user.model';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { VerifiedIcon } from '@/shared/components/verified-icon/verified-icon';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { NgOptimizedImage } from '@angular/common';
/*   */
import { Button } from '@/shared/components/button/button';
import { SafeAvatarUrlPipe } from '@/shared/pipes/safe-avatar-url.pipe';
import { ToasterService } from 'better-toast';

@Component({
  selector: 'li[appUserCard]',
  imports: [RouterLink, VerifiedIcon, NgOptimizedImage, Button, SafeAvatarUrlPipe],
  templateUrl: './user-card.html',
  styleUrl: './user-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class:
      'grid grid-cols-[2.8rem_1fr_auto] gap-x-2 px-2 md:px-4 py-4 border-b last:border-b-0 border-gray-200 dark:border-zinc-800/50 ',
  },
})
export class UserCard {
  private router = inject(Router);
  private userService = inject(UserService);
  private modalService = inject(ModalService);
  private toaster = inject(ToasterService);
  private destroyRef = inject(DestroyRef);

  openDialog = this.modalService.openDialog;

  user = input.required<User>();
  isAuthenticated = input.required<boolean>();
  currentUser = input.required<User | null>();
  followedIds = input.required<string[]>();
  isFollowActionPending = input(false);
  followActionPendingChange = output<boolean>();

  isFollowing = signal(false);
  buttonDisabled = computed(() => this.isFollowing() || this.isFollowActionPending());
  onFollowClick() {
    if (this.buttonDisabled()) return;

    if (this.isAuthenticated()) {
      if (!this.currentUser()) {
        this.openDialog('edit-user', null);
        return;
      }

      this.isFollowing.set(true);
      this.followActionPendingChange.emit(true);
      this.userService
        .followAction(this.user().id, 'follow')
        .pipe(
          finalize(() => {
            this.isFollowing.set(false);
            this.followActionPendingChange.emit(false);
          }),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe({
          error: (error: Error) => {
            this.toaster.error(error.message);
          },
        });

      return;
    }

    this.router.navigate(['/auth']);
  }
}
