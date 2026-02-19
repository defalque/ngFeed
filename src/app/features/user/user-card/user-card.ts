import { AuthService } from '@/core/services/auth.service';
import { ModalService } from '@/core/services/modal.service';
import { UserService } from '@/core/services/user.service';
import { User } from '@/core/types/user.model';
import { Component, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { VerifiedIcon } from '@/shared/components/verified-icon/verified-icon';

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

  isAuthenticated = this.authService.isAuthenticated;
  currentUser = this.userService.loadedCurrentUser;
  openDialog = this.modalService.openDialog;

  user = input.required<User>();

  onFollowClick() {
    if (this.isAuthenticated()) {
      if (!this.currentUser()) {
        this.openDialog('edit-user', null);
        return;
      }

      // logica follow-user
      return;
    }

    this.router.navigate(['/auth']);
  }
}
