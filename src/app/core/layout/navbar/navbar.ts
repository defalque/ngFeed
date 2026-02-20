import { UserService } from '@/core/services/user.service';
import { ModalService } from '@/core/services/modal.service';
import { ClickOutside } from '@/shared/directives/click-outside.directive';
import { Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  LucideAngularModule,
  HouseIcon,
  SearchIcon,
  UserIcon,
  EqualIcon,
  SunIcon,
  MoonIcon,
  PlusIcon,
  BookmarkIcon,
} from 'lucide-angular';
import { NavbarItem } from './navbar-item/navbar-item';
import { DropdownMenu } from '@/shared/components/dropdown-menu/dropdown-menu';
import { AuthService } from '@/core/services/auth.service';

@Component({
  selector: 'app-navbar',
  imports: [LucideAngularModule, ClickOutside, NavbarItem, DropdownMenu],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
})
export class Navbar {
  private router = inject(Router);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private modalService = inject(ModalService);

  isOpen = signal(false);

  currentUserInfo = this.userService.loadedCurrentUser;
  authenticatedUser = this.authService.authenticatedUser;
  isAuthenticated = this.authService.isAuthenticated;

  openDialog = this.modalService.openDialog;

  openCreatePostDialog() {
    if (this.isAuthenticated()) {
      if (!this.currentUserInfo()) {
        this.openDialog('edit-user', null);
        return;
      }
      this.openDialog('create', null);
      return;
    }

    this.router.navigate(['/auth']);
  }

  redirectTo(path: string) {
    if (this.isAuthenticated()) {
      if (!this.currentUserInfo()) {
        this.openDialog('edit-user', null);
        return;
      }

      this.router.navigate([`${path}`]);
      return;
    }

    this.router.navigate(['/auth']);
  }

  toggleOpen() {
    this.isOpen.set(!this.isOpen());
  }

  closeMenu() {
    this.isOpen.set(false);
  }

  logUserOut(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.authService.logout();
    this.toggleOpen();
  }

  isHomeActive(): boolean {
    const url = this.router.url;
    return url === '/per-te' || url === '/seguiti';
  }

  isActive(path: string) {
    const url = this.router.url;
    return url === path;
  }

  readonly HomeIcon = HouseIcon;
  readonly SearchIcon = SearchIcon;
  readonly UserIcon = UserIcon;
  readonly EqualIcon = EqualIcon;
  readonly SunIcon = SunIcon;
  readonly MoonIcon = MoonIcon;
  readonly PlusIcon = PlusIcon;
  readonly BookmarkIcon = BookmarkIcon;
}
