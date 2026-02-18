import { AuthService } from '@/core/services/auth.service';
import { ModalService } from '@/core/services/modal.service';
import { UserService } from '@/core/services/user.service';
import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './home.html',
  host: { class: 'block w-full' },
})
export class Home {
  private modal = inject(ModalService);
  private authService = inject(AuthService);
  private userService = inject(UserService);

  authUser = this.authService.authenticatedUser;
  currentUser = this.userService.loadedCurrentUser;

  openDialog = this.modal.openDialog;
}
