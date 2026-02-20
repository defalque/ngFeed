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

@Component({
  selector: 'app-user-card',
  imports: [RouterLink, VerifiedIcon, NgOptimizedImage],
  templateUrl: './user-card.html',
  styleUrl: './user-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserCard {
  private router = inject(Router);
  private userService = inject(UserService);
  private modalService = inject(ModalService);
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
          takeUntilDestroyed(this.destroyRef),
          finalize(() => {
            this.isFollowing.set(false);
            this.followActionPendingChange.emit(false);
          }),
        )
        .subscribe({
          error: (error: Error) => {
            console.log(error);
          },
        });

      return;
    }

    this.router.navigate(['/auth']);
  }
}
