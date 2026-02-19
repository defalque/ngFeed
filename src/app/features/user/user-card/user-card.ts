import { AuthService } from '@/core/services/auth.service';
import { ModalService } from '@/core/services/modal.service';
import { UserService } from '@/core/services/user.service';
import { User } from '@/core/types/user.model';
import { Component, computed, DestroyRef, inject, input, output, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { VerifiedIcon } from '@/shared/components/verified-icon/verified-icon';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-user-card',
  imports: [RouterLink, VerifiedIcon],
  templateUrl: './user-card.html',
  styleUrl: './user-card.css',
})
export class UserCard {
  private router = inject(Router);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private modalService = inject(ModalService);
  private destroyRef = inject(DestroyRef);

  isAuthenticated = this.authService.isAuthenticated;
  currentUser = this.userService.loadedCurrentUser;
  followedIds = this.userService.loadedFollowedIds;
  openDialog = this.modalService.openDialog;

  id = input.required<string>();

  user = input.required<User>();
  isFollowActionPending = input(false);
  followActionPendingChange = output<boolean>();

  isFollowing = signal(false);
  buttonDisabled = computed(() => this.isFollowing() || this.isFollowActionPending());
  userIsFollowing = computed(() => {
    return this.followedIds().includes(this.id());
  });
  onFollowClick() {
    if (this.buttonDisabled()) return;

    if (this.isAuthenticated()) {
      if (!this.user()) {
        this.openDialog('edit-user', null);
        return;
      }

      this.isFollowing.set(true);
      this.followActionPendingChange.emit(true);
      if (this.userIsFollowing()) {
        this.userService
          .followAction(this.id(), 'unfollow')
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
      } else {
        this.userService
          .followAction(this.id(), 'follow')
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
      }
      return;
    }

    this.router.navigate(['/auth']);
  }
}
