import { AuthService } from '@/core/services/auth.service';
import { ModalService } from '@/core/services/modal.service';
import { UserService } from '@/core/services/user.service';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';
import { Button } from '@/shared/components/button/button';
import { SafeAvatarUrlPipe } from '@/shared/pipes/safe-avatar-url.pipe';

@Component({
  selector: 'app-home',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgOptimizedImage, Button, SafeAvatarUrlPipe],
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
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
